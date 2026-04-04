const DECISIONS = ["APPROVE", "BLOCK", "MFA"];
const DEVICES = ["Desktop", "Mobile", "Tablet", "POS Terminal", "API"];
const LOCATIONS = ["US", "UK", "CA", "FR", "DE", "IN", "SG", "AU", "JP", "BR"];
const MERCHANTS = ["Retail", "Travel", "Electronics", "Gaming", "Crypto", "Wire Transfer", "Jewelry", "Charity"];
const USER_IDS = Array.from({ length: 30 }, (_, i) => `U_${1000 + i}`);

function randomId() {
  return "TXN-" + Math.random().toString(36).slice(2, 10).toUpperCase();
}

function randomDecision() {
  const r = Math.random();
  return r < 0.7 ? "APPROVE" : r < 0.88 ? "MFA" : "BLOCK";
}

function randomScore(decision) {
  if (decision === "BLOCK") return 0.75 + Math.random() * 0.25;
  if (decision === "MFA") return 0.45 + Math.random() * 0.35;
  return Math.random() * 0.45;
}

function randomAmount(decision) {
  if (decision === "BLOCK") return 5000 + Math.random() * 45000;
  if (decision === "MFA") return 1000 + Math.random() * 10000;
  return 5 + Math.random() * 2000;
}

const _userProfiles = {};
USER_IDS.forEach(uid => {
  _userProfiles[uid] = {
    user_id: uid,
    avg_amount: 50 + Math.random() * 500,
    std_amount: 20 + Math.random() * 200,
    avg_velocity: 1 + Math.random() * 3,
    typical_locations: [LOCATIONS[Math.floor(Math.random() * 3)], LOCATIONS[Math.floor(Math.random() * 3)]],
    typical_devices: [DEVICES[Math.floor(Math.random() * 2)]],
    typical_merchants: [MERCHANTS[Math.floor(Math.random() * 4)]],
    total_txns: 0,
    total_fraud: 0,
    risk_trend: [],
    last_seen: null,
    anomaly_flags: [],
    velocity_history: [],
    amount_history: [],
    connections: 0,
  };
});

const _fraudRings = [
  {
    id: "RING-001",
    confidence: 0.87,
    nodes: ["U_1003", "U_1007", "U_1012", "U_1019"],
    shared_devices: ["DEV_X77"],
    shared_ips: ["192.168.44.1"],
    shared_merchants: ["Crypto", "Wire Transfer"],
    total_loss: 45200,
    status: "active",
  },
  {
    id: "RING-002",
    confidence: 0.62,
    nodes: ["U_1005", "U_1014", "U_1022"],
    shared_devices: ["DEV_Y33"],
    shared_ips: ["10.0.5.12"],
    shared_merchants: ["Electronics", "Gaming"],
    total_loss: 18700,
    status: "investigating",
  },
  {
    id: "RING-003",
    confidence: 0.91,
    nodes: ["U_1001", "U_1008", "U_1015", "U_1023", "U_1027"],
    shared_devices: ["DEV_Z99", "DEV_A11"],
    shared_ips: ["172.16.0.5"],
    shared_merchants: ["Jewelry", "Travel"],
    total_loss: 72300,
    status: "active",
  },
];

const _fraudChains = [
  {
    id: "CHAIN-001",
    status: "active",
    stages: [
      { type: "login_anomaly", user_id: "U_1003", time: "14:22:01", detail: "New device from unknown IP" },
      { type: "credential_stuff", user_id: "U_1003", time: "14:22:15", detail: "3 failed login attempts" },
      { type: "profile_change", user_id: "U_1003", time: "14:23:02", detail: "Email changed" },
      { type: "high_value_txn", user_id: "U_1003", time: "14:24:30", detail: "$12,500 wire transfer" },
    ],
    risk_score: 0.94,
  },
  {
    id: "CHAIN-002",
    status: "mitigated",
    stages: [
      { type: "login_anomaly", user_id: "U_1014", time: "13:10:44", detail: "Login from new country" },
      { type: "velocity_spike", user_id: "U_1014", time: "13:15:20", detail: "8 txns in 5 minutes" },
      { type: "high_value_txn", user_id: "U_1014", time: "13:16:00", detail: "$8,200 crypto purchase" },
    ],
    risk_score: 0.81,
  },
];

function generateTransaction(overrides = {}) {
  const decision = overrides.decision || randomDecision();
  const score = randomScore(decision);
  const amount = overrides.amount || randomAmount(decision);
  const userId = overrides.user_id || USER_IDS[Math.floor(Math.random() * USER_IDS.length)];
  const now = new Date();
  const profile = _userProfiles[userId];

  if (profile) {
    profile.total_txns++;
    profile.last_seen = now.toISOString();
    profile.amount_history.push(amount);
    if (profile.amount_history.length > 100) profile.amount_history.shift();

    const currentVelocity = profile.total_txns / Math.max(1, (now - new Date(now.getTime() - 3600000)) / 3600000);
    profile.velocity_history.push({ time: now.toISOString(), velocity: currentVelocity });
    if (profile.velocity_history.length > 60) profile.velocity_history.shift();

    const avgAmount = profile.amount_history.reduce((a, b) => a + b, 0) / profile.amount_history.length;
    profile.avg_amount = avgAmount;

    const deviation = Math.abs(amount - profile.avg_amount) / Math.max(1, profile.std_amount);
    profile.anomaly_flags = [];
    if (deviation > 2) profile.anomaly_flags.push("amount_deviation");
    if (!profile.typical_locations.includes(overrides.location || LOCATIONS[0])) profile.anomaly_flags.push("location_anomaly");
    if (profile.velocity_history.length > 2) {
      const recentV = profile.velocity_history.slice(-3).map(v => v.velocity);
      const avgV = recentV.reduce((a, b) => a + b, 0) / recentV.length;
      if (avgV > profile.avg_velocity * 2) profile.anomaly_flags.push("velocity_spike");
    }
    if (decision === "BLOCK") profile.total_fraud++;

    profile.risk_trend.push({ time: now.toISOString(), score });
    if (profile.risk_trend.length > 120) profile.risk_trend.shift();

    profile.connections = Math.floor(profile.total_txns / 3);
  }

  return {
    id: randomId(),
    user_id: userId,
    amount: Math.round(amount * 100) / 100,
    currency: "USD",
    device: DEVICES[Math.floor(Math.random() * DEVICES.length)],
    location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
    merchant: MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)],
    timestamp: now.toISOString(),
    time: now.toLocaleTimeString(),
    risk_score: Math.round(score * 100) / 100,
    decision,
    reasons: decision === "BLOCK"
      ? ["Unusual velocity spike", "High-risk merchant category"]
      : decision === "MFA"
        ? ["New device detected", "Cross-border transaction"]
        : [],
    user_override: null,
    ...overrides,
  };
}

function generateInitialTransactions(count = 80) {
  const txns = [];
  for (let i = 0; i < count; i++) {
    const t = generateTransaction();
    const pastTime = new Date(Date.now() - (count - i) * 2000);
    t.timestamp = pastTime.toISOString();
    t.time = pastTime.toLocaleTimeString();
    txns.push(t);
  }
  return txns.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

let _transactions = generateInitialTransactions();
let _listeners = [];
let _streamInterval = null;

let _modelAccuracy = 0.858;
let _modelDrift = 0.03;
let _accuracyHistory = Array.from({ length: 30 }, (_, i) => ({
  epoch: i,
  accuracy: 0.70 + Math.random() * 0.12 + (i / 30) * 0.12,
  drift: 0.05 - (i / 30) * 0.03,
}));

// Real-time graph data that continuously grows
let _graphNodes = [];
let _graphEdges = [];
let _graphDataInitialized = false;

function initGraphData() {
  if (_graphDataInitialized) return;
  _graphDataInitialized = true;

  // Create nodes for users, devices, merchants
  USER_IDS.forEach(uid => {
    const profile = _userProfiles[uid];
    const riskScore = profile.risk_trend.length > 0 ? profile.risk_trend[profile.risk_trend.length - 1]?.score : 0.3;
    _graphNodes.push({
      id: uid,
      type: "user",
      label: uid,
      risk_score: riskScore,
      connections: profile.connections,
    });
  });

  DEVICES.forEach(dev => {
    _graphNodes.push({
      id: `DEV:${dev}`,
      type: "device",
      label: dev,
      risk_score: 0.1 + Math.random() * 0.3,
      connections: 5 + Math.floor(Math.random() * 15),
    });
  });

  MERCHANTS.forEach(m => {
    _graphNodes.push({
      id: `MER:${m}`,
      type: "merchant",
      label: m,
      risk_score: 0.2 + Math.random() * 0.5,
      connections: 3 + Math.floor(Math.random() * 10),
    });
  });

  // Create edges based on transactions
  _transactions.forEach(tx => {
    _graphEdges.push({
      source: tx.user_id,
      target: `MER:${tx.merchant}`,
      weight: 1,
      type: "transaction",
      amount: tx.amount,
      timestamp: tx.timestamp,
    });
    _graphEdges.push({
      source: tx.user_id,
      target: `DEV:${tx.device}`,
      weight: 1,
      type: "device_usage",
    });
  });

  // Add fraud ring edges
  _fraudRings.forEach(ring => {
    ring.nodes.forEach(uid => {
      ring.shared_devices.forEach(dev => {
        _graphEdges.push({
          source: uid,
          target: `DEV:${dev}`,
          weight: 3,
          type: "shared_device",
          ring: ring.id,
        });
      });
      ring.shared_merchants.forEach(m => {
        _graphEdges.push({
          source: uid,
          target: `MER:${m}`,
          weight: 2,
          type: "shared_merchant",
          ring: ring.id,
        });
      });
    });

    // Inter-user connections within ring
    for (let i = 0; i < ring.nodes.length; i++) {
      for (let j = i + 1; j < ring.nodes.length; j++) {
        _graphEdges.push({
          source: ring.nodes[i],
          target: ring.nodes[j],
          weight: 4,
          type: "fraud_ring",
          ring: ring.id,
          confidence: ring.confidence,
        });
      }
    }
  });
}

function subscribe(fn) {
  _listeners.push(fn);
  return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function notify() {
  _listeners.forEach(fn => fn(_transactions));
}

function startStream() {
  if (_streamInterval) return;
  initGraphData();
  _streamInterval = setInterval(() => {
    const newTx = generateTransaction();
    _transactions = [newTx, ..._transactions].slice(0, 500);

    // Update graph with new transaction
    _graphEdges.push({
      source: newTx.user_id,
      target: `MER:${newTx.merchant}`,
      weight: 1,
      type: "transaction",
      amount: newTx.amount,
      timestamp: newTx.timestamp,
    });
    _graphEdges.push({
      source: newTx.user_id,
      target: `DEV:${newTx.device}`,
      weight: 1,
      type: "device_usage",
    });

    // Update node risk scores
    const profile = _userProfiles[newTx.user_id];
    if (profile) {
      const node = _graphNodes.find(n => n.id === newTx.user_id);
      if (node) {
        node.risk_score = profile.risk_trend.length > 0 ? profile.risk_trend[profile.risk_trend.length - 1]?.score : 0.3;
        node.connections = profile.connections;
      }
    }

    // Adaptive learning
    _modelAccuracy = Math.min(0.97, _modelAccuracy + (Math.random() - 0.4) * 0.002);
    _modelDrift = Math.max(0.001, _modelDrift + (Math.random() - 0.55) * 0.001);
    _accuracyHistory.push({
      epoch: _accuracyHistory.length,
      accuracy: _modelAccuracy,
      drift: _modelDrift,
    });
    if (_accuracyHistory.length > 60) _accuracyHistory.shift();

    notify();
  }, 1500);
}

function stopStream() {
  if (_streamInterval) {
    clearInterval(_streamInterval);
    _streamInterval = null;
  }
}

function getTransactions() {
  return _transactions;
}

function getUserProfiles() {
  return _userProfiles;
}

function getFraudRings() {
  return _fraudRings;
}

function getFraudChains() {
  return _fraudChains;
}

function getModelMetrics() {
  return {
    accuracy: _modelAccuracy,
    drift: _modelDrift,
    history: _accuracyHistory,
    total_transactions: _transactions.length,
    total_profiles: Object.keys(_userProfiles).length,
    active_rings: _fraudRings.filter(r => r.status === "active").length,
    active_chains: _fraudChains.filter(c => c.status === "active").length,
  };
}

function getGraphData() {
  initGraphData();
  return { nodes: _graphNodes, edges: _graphEdges };
}

function overrideDecision(id, newDecision) {
  _transactions = _transactions.map(tx =>
    tx.id === id ? { ...tx, decision: newDecision, user_override: newDecision } : tx
  );
  notify();
}

function markAsFraud(id) {
  _transactions = _transactions.map(tx =>
    tx.id === id ? { ...tx, decision: "BLOCK", user_override: "BLOCK", marked_fraud: true } : tx
  );
  notify();
}

function markAsLegitimate(id) {
  _transactions = _transactions.map(tx =>
    tx.id === id ? { ...tx, decision: "APPROVE", user_override: "APPROVE", marked_legit: true } : tx
  );
  notify();
}

export const mockFraudService = {
  subscribe,
  startStream,
  stopStream,
  getTransactions,
  getUserProfiles,
  getFraudRings,
  getFraudChains,
  getModelMetrics,
  getGraphData,
  overrideDecision,
  markAsFraud,
  markAsLegitimate,
  generateTransaction,
};
