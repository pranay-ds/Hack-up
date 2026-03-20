// ============================================================
// FFDS — Synthetic Data Simulator
// Generates realistic transactions, fraud events, and metrics
// ============================================================

export type TxnStatus = 'approved' | 'flagged' | 'blocked' | 'otp';
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  merchant: string;
  category: string;
  location: string;
  device: string;
  ip: string;
  riskScore: number;
  status: TxnStatus;
  timestamp: Date;
  flagReason?: string;
  mlScore: number;
  ruleScore: number;
  behaviorScore: number;
}

export interface FraudAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  userId: string;
  amount: number;
  location: string;
  riskScore: number;
  timestamp: Date;
  acknowledged: boolean;
}

const MERCHANTS = [
  'Amazon India', 'Flipkart', 'Swiggy', 'Zomato', 'BigBasket',
  'IRCTC', 'BookMyShow', 'Nykaa', 'Meesho', 'Jio Mart',
  'Shell Petrol', 'HDFC Netbanking', 'Gold Jewellers', 'FX Exchange', 'Steam Gaming',
  'Unknown Merchant', 'Offshore Casino', 'Dark Market XZ',
];
const CATEGORIES = ['E-Commerce', 'Food & Dining', 'Travel', 'Entertainment', 'Fuel', 'Jewellery', 'Gaming', 'International', 'Banking'];
const LOCATIONS = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'New York', 'Dubai', 'Singapore', 'Unknown'];
const DEVICES = ['iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Pro', 'Windows PC', 'Unknown Device', 'Rooted Android'];
const IPS = ['122.160.45.12', '103.21.58.90', '185.220.101.5', '45.142.212.10', '192.168.1.1', '10.0.0.45', '213.109.202.15'];

let txnCounter = 1001;

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function uid(): string { return Math.random().toString(36).slice(2, 10).toUpperCase(); }

export function generateTransaction(isFraud = false): Transaction {
  const amount = isFraud ? rand(50000, 200000) : rand(100, 15000);
  const location = isFraud ? pick(['Unknown', 'New York', 'Dubai', 'Singapore']) : pick(LOCATIONS.slice(0, 7));
  const device = isFraud ? pick(['Unknown Device', 'Rooted Android']) : pick(DEVICES.slice(0, 4));
  const merchant = isFraud ? pick(MERCHANTS.slice(14)) : pick(MERCHANTS.slice(0, 12));

  const mlScore     = isFraud ? rand(0.65, 0.98) : rand(0.02, 0.35);
  const ruleScore   = isFraud ? rand(0.60, 0.95) : rand(0.00, 0.30);
  const behavScore  = isFraud ? rand(0.55, 0.90) : rand(0.03, 0.25);
  const riskScore   = Math.round((mlScore * 0.4 + ruleScore * 0.3 + behavScore * 0.3) * 100);

  let status: TxnStatus = 'approved';
  if (riskScore >= 70) status = 'blocked';
  else if (riskScore >= 45) status = 'flagged';
  else if (riskScore >= 30) status = 'otp';

  return {
    id: `TXN${txnCounter++}`,
    userId: `USR${Math.floor(1000 + Math.random() * 9000)}`,
    amount: Math.round(amount),
    merchant,
    category: pick(CATEGORIES),
    location,
    device,
    ip: pick(IPS),
    riskScore,
    status,
    timestamp: new Date(),
    flagReason: isFraud ? pick(['Unusual location', 'High amount spike', 'Unknown device', 'Velocity check', 'Impossible travel']) : undefined,
    mlScore:     Math.round(mlScore * 100),
    ruleScore:   Math.round(ruleScore * 100),
    behaviorScore: Math.round(behavScore * 100),
  };
}

export function generateTransactionBatch(count = 20): Transaction[] {
  return Array.from({ length: count }, (_, i) => generateTransaction(Math.random() < 0.12 || i === 3 || i === 11));
}

export function generateAlert(severity?: AlertSeverity): FraudAlert {
  const sev: AlertSeverity = severity ?? pick(['critical', 'high', 'medium', 'low']);
  const scenarios = {
    critical: {
      title: '🚨 Fraud Detected — Account Takeover',
      desc: 'Login from a new device followed by ₹1,45,000 international transfer',
    },
    high: {
      title: '⚠️ Impossible Travel Detected',
      desc: 'Transaction in Mumbai → New York within 8 minutes',
    },
    medium: {
      title: '🔶 Velocity Spike',
      desc: '12 transactions in 90 seconds — card cloning suspected',
    },
    low: {
      title: 'ℹ️ Unusual Merchant',
      desc: 'First-time transaction with high-risk merchant category',
    },
  };
  return {
    id: `ALT${uid()}`,
    severity: sev,
    title: scenarios[sev].title,
    description: scenarios[sev].desc,
    userId: `USR${Math.floor(1000 + Math.random() * 9000)}`,
    amount: Math.round(rand(5000, 150000)),
    location: pick(LOCATIONS),
    riskScore: sev === 'critical' ? Math.round(rand(82, 99))
             : sev === 'high'     ? Math.round(rand(70, 82))
             : sev === 'medium'   ? Math.round(rand(45, 70))
             : Math.round(rand(20, 45)),
    timestamp: new Date(),
    acknowledged: false,
  };
}

export function generateInitialAlerts(): FraudAlert[] {
  return [
    generateAlert('critical'),
    generateAlert('critical'),
    generateAlert('high'),
    generateAlert('high'),
    generateAlert('medium'),
    generateAlert('medium'),
    generateAlert('low'),
  ];
}

// Dashboard metrics
export function getDashboardMetrics() {
  return {
    totalTransactions: 48_291,
    fraudDetected:     1_247,
    fraudRate:         2.58,
    riskScoreAvg:      38,
    amountSaved:       '₹2.4 Cr',
    activeAlerts:      8,
    modelsRunning:     3,
    rulesActive:       12,
  };
}

// Hourly fraud trend (last 24 hrs)
export function getHourlyTrend() {
  return Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2,'0')}:00`,
    transactions: Math.floor(rand(200, 900)),
    fraud:        Math.floor(rand(2, 35)),
  }));
}

// Risk score distribution
export function getRiskDistribution() {
  return [
    { range: '0–10',  count: 8200 },
    { range: '11–20', count: 6400 },
    { range: '21–30', count: 4800 },
    { range: '31–40', count: 3200 },
    { range: '41–50', count: 2100 },
    { range: '51–60', count: 1400 },
    { range: '61–70', count: 900 },
    { range: '71–80', count: 580 },
    { range: '81–90', count: 320 },
    { range: '91–100',count: 180 },
  ];
}

// Model metrics
export const modelMetrics = [
  { name: 'Logistic Regression', accuracy: 87.4, precision: 79.2, recall: 71.8, f1: 75.3, type: 'Baseline',  color: '#00d4ff' },
  { name: 'Random Forest',       accuracy: 93.6, precision: 88.7, recall: 85.2, f1: 86.9, type: 'Strong',    color: '#00ff88' },
  { name: 'XGBoost',             accuracy: 96.2, precision: 93.1, recall: 91.4, f1: 92.2, type: 'Best',      color: '#7b2fff' },
  { name: 'Isolation Forest',    accuracy: 91.0, precision: 84.5, recall: 88.3, f1: 86.3, type: 'Anomaly',   color: '#ffd60a' },
];

// User behavior profiles
export const userProfiles = [
  { id: 'USR1042', name: 'Aryan Mehta',  avgSpend: 2400,  activeHours: '9AM–11PM',  locations: 'Mumbai', riskLevel: 'low',    status: 'Normal' },
  { id: 'USR2391', name: 'Priya Sharma', avgSpend: 8200,  activeHours: '10AM–8PM',  locations: 'Delhi',  riskLevel: 'medium', status: 'Flagged' },
  { id: 'USR3847', name: 'Rahul Singh',  avgSpend: 15600, activeHours: '12AM–4AM',  locations: 'Unknown',riskLevel: 'high',   status: 'Blocked' },
  { id: 'USR4102', name: 'Sneha Patel',  avgSpend: 3100,  activeHours: '8AM–10PM',  locations: 'Pune',   riskLevel: 'low',    status: 'Normal' },
  { id: 'USR5508', name: 'Dev Kumar',    avgSpend: 4700,  activeHours: '6PM–2AM',   locations: 'Bangalore',riskLevel:'medium',status: 'Under Review' },
];

// Fraud rules
export const fraudRules = [
  { id: 'R001', name: 'High Amount Threshold',   condition: 'amount > ₹1,00,000',          triggered: 142, active: true  },
  { id: 'R002', name: 'Velocity Check',           condition: 'txn_count > 5 in 60s',        triggered: 89,  active: true  },
  { id: 'R003', name: 'Impossible Travel',        condition: 'travel_speed > 900 km/h',     triggered: 34,  active: true  },
  { id: 'R004', name: 'Foreign Transaction Flag', condition: 'location_change && intl=true', triggered: 218, active: true  },
  { id: 'R005', name: 'Unknown Device Alert',     condition: 'device_seen_before = false',  triggered: 67,  active: true  },
  { id: 'R006', name: 'Night Transaction Spike',  condition: 'time > 01:00 && amount>50000',triggered: 28,  active: true  },
  { id: 'R007', name: 'Blacklisted Merchant',     condition: 'merchant IN blacklist',        triggered: 11,  active: false },
  { id: 'R008', name: 'OTP Bypass Attempt',       condition: 'otp_fail_count > 3',          triggered: 5,   active: true  },
  { id: 'R009', name: 'VPN/TOR Detection',        condition: 'ip_type IN [vpn, tor]',       triggered: 156, active: true  },
  { id: 'R010', name: 'Card Testing Pattern',     condition: 'avg_amount < ₹100 && count>10',triggered: 44, active: false },
];

// Geo transaction data
export const geoTransactions = [
  { lat: 19.07, lng: 72.87, city: 'Mumbai',    amount: 4200,   risk: 15, status: 'approved' },
  { lat: 28.61, lng: 77.20, city: 'Delhi',     amount: 12000,  risk: 62, status: 'flagged'  },
  { lat: 12.97, lng: 77.59, city: 'Bangalore', amount: 2800,   risk: 22, status: 'approved' },
  { lat: 17.38, lng: 78.48, city: 'Hyderabad', amount: 9500,   risk: 48, status: 'otp'      },
  { lat: 40.71, lng:-74.00, city: 'New York',  amount: 145000, risk: 94, status: 'blocked'  },
  { lat:25.20, lng: 55.27,  city: 'Dubai',     amount: 82000,  risk: 87, status: 'blocked'  },
  { lat: 1.35,  lng:103.82, city: 'Singapore', amount: 61000,  risk: 78, status: 'blocked'  },
  { lat: 22.57, lng: 88.36, city: 'Kolkata',   amount: 1800,   risk: 18, status: 'approved' },
  { lat: 18.52, lng: 73.86, city: 'Pune',      amount: 3200,   risk: 21, status: 'approved' },
];

// SHAP values for explainability
export const shapValues = [
  { feature: 'Transaction Amount',   value: +0.38, impact: 'positive' },
  { feature: 'Location Mismatch',    value: +0.31, impact: 'positive' },
  { feature: 'Unknown Device',       value: +0.22, impact: 'positive' },
  { feature: 'Time Anomaly (3AM)',   value: +0.18, impact: 'positive' },
  { feature: 'Velocity (12 txns)',   value: +0.15, impact: 'positive' },
  { feature: 'VPN Detected',         value: +0.12, impact: 'positive' },
  { feature: 'Merchant Risk Score',  value: +0.09, impact: 'positive' },
  { feature: 'Account Age',          value: -0.07, impact: 'negative' },
  { feature: 'Avg Spend History',    value: -0.11, impact: 'negative' },
  { feature: 'Trusted Device',       value: -0.15, impact: 'negative' },
];

// Device fingerprints
export const deviceFingerprints = [
  { id: 'DEV001', type: 'Mobile', os: 'iOS 17.4', browser: 'Safari 17', screen: '390×844',  tz: 'Asia/Kolkata', known: true,  risk: 'low'    },
  { id: 'DEV002', type: 'Desktop', os: 'Windows 11', browser: 'Chrome 122', screen: '1920×1080', tz: 'Asia/Kolkata', known: true,  risk: 'low' },
  { id: 'DEV003', type: 'Mobile', os: 'Android 13', browser: 'Unknown', screen: '360×800', tz: 'Europe/London', known: false, risk: 'high'   },
  { id: 'DEV004', type: 'Desktop', os: 'Linux', browser: 'Tor Browser', screen: '1280×720', tz: 'UTC', known: false, risk: 'critical' },
];

// IP intelligence
export const ipIntelligence = [
  { ip: '122.160.45.12', country: 'India',       type: 'Residential', risk: 'low',      vpn: false, tor: false },
  { ip: '103.21.58.90',  country: 'India',       type: 'Mobile ISP',  risk: 'low',      vpn: false, tor: false },
  { ip: '185.220.101.5', country: 'Netherlands', type: 'TOR Exit',    risk: 'critical', vpn: false, tor: true  },
  { ip: '45.142.212.10', country: 'Germany',     type: 'VPN',         risk: 'high',     vpn: true,  tor: false },
  { ip: '213.109.202.15',country: 'Ukraine',     type: 'Hosting',     risk: 'high',     vpn: true,  tor: false },
];

// Anomaly scatter data
export function getAnomalyData() {
  const normal = Array.from({ length: 120 }, () => ({
    x: rand(100, 8000),
    y: rand(5, 40),
    type: 'normal',
  }));
  const anomaly = Array.from({ length: 18 }, () => ({
    x: rand(40000, 180000),
    y: rand(65, 99),
    type: 'anomaly',
  }));
  return [...normal, ...anomaly];
}

// Behavior timeline (spending over 30 days)
export function getBehaviorTimeline(userId: string) {
  const baseline = userId === 'USR3847' ? 4000 : 2400;
  return Array.from({ length: 30 }, (_, i) => ({
    day: `D${i + 1}`,
    actual:   Math.round(rand(baseline * 0.4, baseline * 1.6)),
    baseline: baseline,
  }));
}
