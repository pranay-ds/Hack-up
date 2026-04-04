import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { evaluateTransaction, connectWebSocket } from "../services/api";
import { mockFraudService } from "../services/mockFraudService";

const DEVICES = ["Desktop", "Mobile", "Tablet", "POS Terminal", "API"];
const LOCATIONS = ["US", "UK", "CA", "FR", "DE", "IN", "SG", "AU", "JP", "BR"];
const MERCHANTS = ["Retail", "Travel", "Electronics", "Gaming", "Crypto", "Wire Transfer", "Jewelry", "Charity"];
const USER_IDS = Array.from({ length: 30 }, (_, i) => `U_${1000 + i}`);

function randomId() {
  return "TXN-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function generatePayload() {
  const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const isFraud = Math.random() < 0.15;
  const amount = isFraud ? 5000 + Math.random() * 45000 : 5 + Math.random() * 2000;
  return {
    transaction_id: randomId(),
    user_id: USER_IDS[Math.floor(Math.random() * USER_IDS.length)],
    amount: Math.round(amount * 100) / 100,
    currency: "USD",
    timestamp: new Date().toISOString(),
    merchant_id: merchant,
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    device_id: device,
    ip_address: `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`,
    metadata: { device, merchant_category: merchant, txn_count_1h: Math.floor(Math.random() * 5) },
  };
}

function makeSyntheticTx(decision) {
  const isFraud = decision === "BLOCK";
  const amount = isFraud ? 5000 + Math.random() * 45000 : decision === "MFA" ? 1000 + Math.random() * 10000 : 5 + Math.random() * 2000;
  const score = isFraud ? 0.75 + Math.random() * 0.25 : decision === "MFA" ? 0.45 + Math.random() * 0.35 : Math.random() * 0.45;
  const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  return {
    id: randomId(),
    user_id: USER_IDS[Math.floor(Math.random() * USER_IDS.length)],
    amount: Math.round(amount * 100) / 100,
    currency: "USD",
    device,
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    merchant,
    timestamp: new Date().toISOString(),
    time: new Date().toLocaleTimeString(),
    risk_score: Math.round(score * 100) / 100,
    decision,
    reasons: decision === "BLOCK"
      ? ["Unusual velocity spike", "High-risk merchant category", "Amount deviation from baseline"]
      : decision === "MFA"
        ? ["New device detected", "Cross-border transaction", "Unusual time pattern"]
        : [],
    user_override: null,
    marked_fraud: false,
    marked_legit: false,
  };
}

export function useFraudData() {
  const [transactions, setTransactions] = useState([]);
  const [streamStatus, setStreamStatus] = useState("connecting");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiLatencyMs, setApiLatencyMs] = useState(null);
  const trafficRef = useRef(null);

  // Send traffic every 1.5s via HTTP and add result directly
  useEffect(() => {
    let active = true;

    const sendTraffic = async () => {
      try {
        const payload = generatePayload();
        const start = Date.now();
        const result = await evaluateTransaction(payload);
        setApiLatencyMs(Date.now() - start);
        if (!active) return;

        const tx = {
          id: result.transaction_id || randomId(),
          user_id: payload.user_id,
          amount: payload.amount,
          currency: "USD",
          device: payload.device_id,
          location: payload.location,
          merchant: payload.merchant_id,
          timestamp: payload.timestamp,
          time: new Date().toLocaleTimeString(),
          risk_score: result.risk_score || 0,
          decision: result.decision || "APPROVE",
          reasons: Array.isArray(result.reasons) ? result.reasons : [],
          user_override: null,
          marked_fraud: false,
          marked_legit: false,
        };

        setTransactions(prev => [tx, ...prev].slice(0, 500));
        setStreamStatus("connected");
        setLoading(false);
        setError(null);
      } catch (err) {
        if (!active) return;
        setError(err.message);
        setApiLatencyMs(null);
        setStreamStatus("error");
        const mockTx = mockFraudService.generateTransaction();
        const tx = { ...mockTx, time: new Date().toLocaleTimeString(), timestamp: new Date().toISOString() };
        setTransactions(prev => [tx, ...prev].slice(0, 500));
        setLoading(false);
      }
    };

    // Inject synthetic MFA and BLOCK transactions every 3s
    const injectSynthetic = () => {
      const r = Math.random();
      let decision;
      if (r < 0.4) decision = "MFA";
      else if (r < 0.7) decision = "BLOCK";
      else decision = "APPROVE";
      const tx = makeSyntheticTx(decision);
      setTransactions(prev => [tx, ...prev].slice(0, 500));
    };

    sendTraffic();
    injectSynthetic();

    trafficRef.current = setInterval(() => {
      sendTraffic();
      injectSynthetic();
    }, 1500);

    return () => {
      active = false;
      if (trafficRef.current) clearInterval(trafficRef.current);
    };
  }, []);

  // WebSocket bonus stream
  useEffect(() => {
    const disconnect = connectWebSocket(
      (data) => {
        setTransactions((prev) => {
          if (prev.some((t) => t.id === data.transaction_id)) return prev;
          const tx = {
            id: data.transaction_id || randomId(),
            user_id: data.user_id || "unknown",
            amount: typeof data.amount === "number" ? data.amount : 0,
            currency: data.currency || "USD",
            device: data.device_id || data.device || "unknown",
            location: data.location || "unknown",
            merchant: data.merchant_id || data.merchant || "unknown",
            timestamp: data.timestamp || new Date().toISOString(),
            time: new Date().toLocaleTimeString(),
            risk_score: typeof data.risk_score === "number" ? data.risk_score : 0,
            decision: data.decision || "APPROVE",
            reasons: Array.isArray(data.reasons) ? data.reasons : [],
            user_override: null,
            marked_fraud: false,
            marked_legit: false,
          };
          return [tx, ...prev].slice(0, 500);
        });
      },
      () => setStreamStatus("connected"),
      () => setStreamStatus((prev) => (prev === "connecting" ? prev : "connecting"))
    );

    return () => {
      disconnect();
    };
  }, []);

  const stats = useMemo(() => {
    const total = transactions.length;
    const fraud = transactions.filter(t => t.decision === "BLOCK").length;
    const mfa = transactions.filter(t => t.decision === "MFA").length;
    const approve = transactions.filter(t => t.decision === "APPROVE").length;
    const fraudRate = total > 0 ? ((fraud / total) * 100).toFixed(1) : "0.0";
    const avgRisk = total > 0 ? (transactions.reduce((s, t) => s + t.risk_score, 0) / total).toFixed(2) : "0.00";
    const moneySaved = transactions.filter(t => t.decision === "BLOCK").reduce((sum, t) => sum + t.amount, 0);
    return { total, fraud, mfa, approve, fraudRate, avgRisk, moneySaved };
  }, [transactions]);

  const mfaTransactions = useMemo(() => transactions.filter(t => t.decision === "MFA"), [transactions]);
  const alerts = useMemo(() => transactions.filter(t => t.decision === "BLOCK" || t.decision === "MFA").slice(0, 20), [transactions]);
  const userProfiles = useMemo(() => mockFraudService.getUserProfiles(), []);
  const fraudRings = useMemo(() => mockFraudService.getFraudRings(), []);
  const fraudChains = useMemo(() => mockFraudService.getFraudChains(), []);
  const modelMetrics = useMemo(() => ({ ...mockFraudService.getModelMetrics(), accuracy: 0.858 }), []);

  const overrideDecision = useCallback((id, decision) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, decision, user_override: decision } : tx));
  }, []);

  const markAsFraud = useCallback((id) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, decision: "BLOCK", user_override: "BLOCK", marked_fraud: true } : tx));
  }, []);

  const markAsLegitimate = useCallback((id) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, decision: "APPROVE", user_override: "APPROVE", marked_legit: true } : tx));
  }, []);

  const applyUserAction = useCallback((userId, action) => {
    if (!userId) return;

    setTransactions((prev) => {
      let updated = 0;

      const next = prev.map((tx) => {
        if (tx.user_id !== userId) return tx;
        updated += 1;

        if (action === "block") {
          return {
            ...tx,
            decision: "BLOCK",
            user_override: "BLOCK",
            marked_fraud: true,
            marked_legit: false,
            reasons: tx.reasons?.length ? tx.reasons : ["Analyst action: user blocked from behavior intelligence panel"],
          };
        }

        if (action === "mfa") {
          return {
            ...tx,
            decision: "MFA",
            user_override: "MFA",
            marked_fraud: false,
            marked_legit: false,
            reasons: tx.reasons?.length ? tx.reasons : ["Analyst action: MFA challenge required"],
          };
        }

        if (action === "safe") {
          return {
            ...tx,
            decision: "APPROVE",
            user_override: "APPROVE",
            marked_legit: true,
            marked_fraud: false,
          };
        }

        return tx;
      });

      if (updated > 0) {
        return next;
      }

      if (action !== "block" && action !== "mfa" && action !== "safe") {
        return prev;
      }

      const decision = action === "block" ? "BLOCK" : action === "mfa" ? "MFA" : "APPROVE";
      const synthetic = makeSyntheticTx(decision);

      return [{
        ...synthetic,
        id: randomId(),
        user_id: userId,
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleTimeString(),
        user_override: decision,
        marked_fraud: decision === "BLOCK",
        marked_legit: decision === "APPROVE",
      }, ...prev].slice(0, 500);
    });
  }, []);

  return {
    transactions, stats, mfaTransactions, alerts, userProfiles, fraudRings, fraudChains, modelMetrics,
    streamStatus, loading, error, apiLatencyMs,
    overrideDecision, markAsFraud, markAsLegitimate, applyUserAction,
  };
}
