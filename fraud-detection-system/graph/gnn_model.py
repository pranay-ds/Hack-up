import torch
import torch.nn.functional as F

try:
    from torch_geometric.nn import SAGEConv
    GEOMETRIC_AVAILABLE = True
except ImportError:
    GEOMETRIC_AVAILABLE = False
    
import logging

logger = logging.getLogger(__name__)

class FraudGraphSAGE(torch.nn.Module):
    """
    GraphSAGE specifically captures localized community topological vulnerabilities 
    and handles inductive environments (where nodes continuously spool in real-time).
    """
    def __init__(self, in_channels: int, hidden_channels: int, out_channels: int):
        super(FraudGraphSAGE, self).__init__()
        
        if not GEOMETRIC_AVAILABLE:
             raise ImportError("PyTorch Geometric is required for the GNN Architecture (pip install torch_geometric).")
             
        # SAGE is chosen for perfect efficiency traversing neighborhood samples
        self.conv1 = SAGEConv(in_channels, hidden_channels)
        self.conv2 = SAGEConv(hidden_channels, hidden_channels)
        
        # Classification head determining likelihood of node participating in a fraud ring
        self.fc = torch.nn.Linear(hidden_channels, out_channels)

    def forward(self, x, edge_index):
        # Pass 1: Aggregate hop-1 neighborhoods
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        
        # Pass 2: Aggregate hop-2 neighborhoods (fraud rings are typically 2-hops away from identical IPs)
        x = self.conv2(x, edge_index)
        x = F.relu(x)
        
        # Calculate risk scores
        x = self.fc(x)
        return torch.sigmoid(x)  # Constrain between 0-1 risk

class GNNModelTrainer:
    def __init__(self, model_params: dict):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model = FraudGraphSAGE(**model_params).to(self.device)
        self.optimizer = torch.optim.Adam(self.model.parameters(), lr=0.01)
        self.criterion = torch.nn.BCELoss()

    def train_step(self, data):
        self.model.train()
        self.optimizer.zero_grad()
        
        # Process PyTorch Geometric Data object
        x, edge_index = data.x.to(self.device), data.edge_index.to(self.device)
        labels = data.y.to(self.device)
        
        out = self.model(x, edge_index).squeeze(-1)
        
        # Semi-supervised graph loss using mask
        mask = data.train_mask.to(self.device)
        loss = self.criterion(out[mask], labels[mask].float())
        
        loss.backward()
        self.optimizer.step()
        return loss.item()
        
    def save(self, path: str):
        torch.save(self.model.state_dict(), path)
