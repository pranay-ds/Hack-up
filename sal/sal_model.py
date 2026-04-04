"""
Stake-Aware Learning (SAL) Dual-Head Architecture

Implements the SAL model matching the eval_sal_fpr.py design:

  Backbone: Linear(input_dim → 256) → ReLU → Dropout(0.2) → Linear(256 → 128) → ReLU
  Prediction Head: Linear(128 → 2)   [classification logits]
  Selection Head:  Linear(128 → 64) → ReLU → Linear(64 → 1) → Sigmoid

Margin-Based SAL Loss:
  risk    = mean[ sel_i * (CE_i * stake_i) ]
  penalty = beta * clamp(MARGIN - mean(sel), min=0)
  L_SAL   = risk + penalty

Where:
  sel_i:  Selection gate in [0,1]  (confidence to predict)
  CE_i:   Per-sample cross-entropy
  stake_i: Fraud → ALPHA (200), Normal → 1.0
  MARGIN: Selection threshold for penalty (0.95)
  beta:   Abstention penalty weight (2.28)

The selection head is trained at a much lower LR (1e-5) so that the
prediction head stabilises before the gate starts to suppress.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Tuple, Dict, Optional
from dataclasses import dataclass


# ─────────────────────────────────────────────
# Configuration
# ─────────────────────────────────────────────

@dataclass
class SALConfig:
    """Configuration for Stake-Aware Learning (matches eval_sal_fpr.py defaults)"""
    fraud_stake: float = 200.0          # ALPHA – weight for fraud CE
    normal_stake: float = 1.0           # Weight for normal CE
    abstention_penalty: float = 2.28    # BETA  – margin-guard penalty
    selection_threshold: float = 0.95   # MARGIN – threshold for abstention & tier routing
    confidence_temperature: float = 1.0 # Reserved for future temperature scaling
    enable_mixup: bool = False          # Reserved


# ─────────────────────────────────────────────
# Model Components
# ─────────────────────────────────────────────

class SALModel(nn.Module):
    """
    Stake-Aware Learning dual-head model (eval_sal_fpr.py architecture).

    Shared backbone encodes the input into a 128-dim feature vector.
    The prediction head scores fraud probability; the selection head gates
    whether the model is confident enough to commit to a prediction.

    Architecture:
        backbone:    input_dim → 256 → ReLU → Dropout(0.2) → 128 → ReLU
        head_pred:   128 → 2      (logits for binary classification)
        head_select: 128 → 64 → ReLU → 1 → Sigmoid
    """

    def __init__(self, input_dim: int, config: SALConfig = None):
        super().__init__()
        self.config = config or SALConfig()

        # Shared feature extractor
        self.backbone = nn.Sequential(
            nn.Linear(input_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.2),
            nn.Linear(256, 128),
            nn.ReLU(),
        )

        # Prediction head: simple linear classifier
        self.head_pred = nn.Linear(128, 2)

        # Selection head: deeper to handle margin-based doubt
        self.head_select = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
            nn.Sigmoid(),
        )

    # ------------------------------------------------------------------
    # Forward
    # ------------------------------------------------------------------

    def forward(self, x: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Args:
            x: Feature tensor (batch_size, input_dim)

        Returns:
            logits:    Classification logits (batch_size, 2)
            selection: Confidence gate in [0, 1] (batch_size, 1)
        """
        feat = self.backbone(x)
        return self.head_pred(feat), self.head_select(feat)

    # ------------------------------------------------------------------
    # Margin-Based SAL Loss
    # ------------------------------------------------------------------

    def compute_sal_loss(
        self,
        logits: torch.Tensor,
        selection: torch.Tensor,
        labels: torch.Tensor,
        beta: float = None,
        margin: float = None,
    ) -> Dict[str, torch.Tensor]:
        """
        Margin-based SAL loss (from eval_sal_fpr.py):

            risk    = mean[ sel_i * (CE_i * stake_i) ]
            penalty = beta * clamp(margin - mean(sel), min=0)
            L_SAL   = risk + penalty

        The penalty only fires when the average selection falls *below* the
        margin, preventing over-abstention on clean samples while still
        encouraging confident predictions on hard ones.

        Args:
            logits:    (batch_size, 2)
            selection: (batch_size, 1)
            labels:    (batch_size,)
            beta:      Abstention penalty; uses config.abstention_penalty if None
            margin:    Selection margin; uses config.selection_threshold if None

        Returns:
            Dict with loss components and diagnostics
        """
        if beta is None:
            beta = self.config.abstention_penalty
        if margin is None:
            margin = self.config.selection_threshold

        # Per-sample cross-entropy
        ce = F.cross_entropy(logits, labels, reduction='none')

        # Stake weighting: fraud samples penalised ALPHA× more
        stakes = torch.where(
            labels == 1,
            torch.tensor(self.config.fraud_stake, dtype=torch.float, device=labels.device),
            torch.tensor(self.config.normal_stake,  dtype=torch.float, device=labels.device),
        )

        sel = selection.squeeze(-1)          # (batch_size,)

        # Risk: model pays for confident-but-wrong predictions
        risk = (sel * (ce * stakes)).mean()

        # Penalty: only triggered when selection mean < margin (uncertainty guard)
        penalty = beta * torch.clamp(margin - sel.mean(), min=0.0)

        total_loss = risk + penalty

        abstention_rate = (sel < margin).float().mean()

        return {
            'total_loss': total_loss,
            'risk': risk,
            'penalty': penalty,
            'abstention_rate': abstention_rate,
            'selection_confidence_mean': sel.mean(),
            'selection_confidence_std':  sel.std(),
        }

    # ------------------------------------------------------------------
    # Inference
    # ------------------------------------------------------------------

    def predict(
        self,
        x: torch.Tensor,
        return_uncertainty: bool = True,
        fraud_threshold: float = 0.95,          # High-precision threshold (eval default)
    ) -> Dict[str, np.ndarray]:
        """
        Make predictions with optional uncertainty quantification.

        Args:
            x:                  Feature tensor
            return_uncertainty: Include selection confidence & tier info
            fraud_threshold:    Probability threshold to flag as fraud

        Returns:
            Dict with 'predictions', 'fraud_probability', 'selection_confidence',
            and optionally 'decision_tier', 'high_confidence_mask', 'uncertain_mask'
        """
        self.eval()
        with torch.no_grad():
            logits, sel = self.forward(x)
            probs = F.softmax(logits, dim=1)
            fraud_prob = probs[:, 1]
            sel_flat = sel.squeeze(-1)

            predictions = (fraud_prob > fraud_threshold).long()

            result: Dict[str, np.ndarray] = {
                'predictions':         predictions.cpu().numpy(),
                'fraud_probability':   fraud_prob.cpu().numpy(),
                'selection_confidence': sel_flat.cpu().numpy(),
                'normal_probability':  probs[:, 0].cpu().numpy(),
            }

            if return_uncertainty:
                tier1_mask = sel_flat >= self.config.selection_threshold   # committed
                tier2_mask = ~tier1_mask                                    # abstained

                result['decision_tier'] = np.where(
                    tier1_mask.cpu().numpy(), 1, 2
                )
                result['high_confidence_mask'] = tier1_mask.cpu().numpy()
                result['uncertain_mask']        = tier2_mask.cpu().numpy()

            return result


# ─────────────────────────────────────────────
# Trainer
# ─────────────────────────────────────────────

class SALTrainer:
    """
    Trainer for SALModel with differential learning rates and
    optional per-epoch beta/margin adjustment.

    Learning rate split (matching eval_sal_fpr.py):
        backbone + head_pred : 1e-3   (stabilise first)
        head_select          : 1e-5   (slow gate learning)
    """

    def __init__(
        self,
        model: SALModel,
        config: SALConfig = None,
        lr_backbone: float = 1e-3,
        lr_selection: float = 1e-5,
        device: str = 'cpu',
    ):
        self.model = model.to(device)
        self.config = config or model.config
        self.device = device
        self.beta   = self.config.abstention_penalty
        self.margin = self.config.selection_threshold

        # Differential optimiser – mirrors eval_sal_fpr.py
        self.optimizer = torch.optim.Adam([
            {'params': model.backbone.parameters(),    'lr': lr_backbone},
            {'params': model.head_pred.parameters(),   'lr': lr_backbone},
            {'params': model.head_select.parameters(), 'lr': lr_selection},
        ])

    # ------------------------------------------------------------------

    def train_epoch(
        self,
        train_loader,
        beta:   Optional[float] = None,
        margin: Optional[float] = None,
    ) -> Dict[str, float]:
        """
        Train for one epoch.

        Args:
            train_loader: DataLoader yielding (features, labels)
            beta:   Override abstention penalty for this epoch
            margin: Override selection margin for this epoch

        Returns:
            Averaged metric dict over all batches
        """
        if beta   is not None: self.beta   = beta
        if margin is not None: self.margin = margin

        self.model.train()
        totals: Dict[str, float] = {}
        n_batches = 0

        for features, labels in train_loader:
            features = features.to(self.device)
            labels   = labels.to(self.device)

            self.optimizer.zero_grad()

            logits, selection = self.model(features)
            loss_dict = self.model.compute_sal_loss(
                logits, selection, labels,
                beta=self.beta, margin=self.margin,
            )

            loss_dict['total_loss'].backward()
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            self.optimizer.step()

            for k, v in loss_dict.items():
                totals[k] = totals.get(k, 0.0) + (v.item() if hasattr(v, 'item') else v)

            n_batches += 1

        return {k: v / n_batches for k, v in totals.items()}

    # ------------------------------------------------------------------

    def validate(self, val_loader) -> Dict[str, float]:
        """Evaluate on validation set."""
        self.model.eval()
        totals: Dict[str, float] = {}
        n_batches = 0

        with torch.no_grad():
            for features, labels in val_loader:
                features = features.to(self.device)
                labels   = labels.to(self.device)

                logits, selection = self.model(features)
                loss_dict = self.model.compute_sal_loss(
                    logits, selection, labels,
                    beta=self.beta, margin=self.margin,
                )

                for k, v in loss_dict.items():
                    totals[k] = totals.get(k, 0.0) + (v.item() if hasattr(v, 'item') else v)

                n_batches += 1

        return {k: v / n_batches for k, v in totals.items()}


# ─────────────────────────────────────────────
# Factory
# ─────────────────────────────────────────────

def create_sal_model(
    input_dim: int,
    config: Optional[SALConfig] = None,
    device: str = 'cpu',
    lr_backbone: float = 1e-3,
    lr_selection: float = 1e-5,
) -> Tuple[SALModel, SALTrainer]:
    """
    Factory: create SALModel + SALTrainer ready for training.

    Args:
        input_dim:    Number of input features
        config:       SALConfig (uses defaults if None)
        device:       'cpu' or 'cuda'
        lr_backbone:  LR for backbone + prediction head
        lr_selection: LR for selection head (much lower)

    Returns:
        (model, trainer)
    """
    if config is None:
        config = SALConfig()

    model   = SALModel(input_dim, config)
    trainer = SALTrainer(
        model, config,
        lr_backbone=lr_backbone,
        lr_selection=lr_selection,
        device=device,
    )
    return model, trainer