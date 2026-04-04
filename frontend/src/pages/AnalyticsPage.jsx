import FraudPieChart from "../components/FraudPieChart";
import RiskDistributionChart from "../components/RiskDistributionChart";
import FraudTrendChart from "../components/FraudTrendChart";
import VelocityGraph from "../components/VelocityGraph";
import FraudRingGraph from "../components/FraudRingGraph";
import FraudChainGraph from "../components/FraudChainGraph";
import UserBehaviorPanel from "../components/UserBehaviorPanel";
import AdaptiveLearningPanel from "../components/AdaptiveLearningPanel";

export default function AnalyticsPage({ transactions, userProfiles, fraudRings, fraudChains, modelMetrics }) {
  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e5e5" }}>Analytics</div>
      <AdaptiveLearningPanel modelMetrics={modelMetrics} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FraudTrendChart transactions={transactions} />
        <FraudPieChart transactions={transactions} />
      </div>
      <VelocityGraph transactions={transactions} />
      <RiskDistributionChart transactions={transactions} />
      <FraudRingGraph fraudRings={fraudRings} />
      <FraudChainGraph fraudChains={fraudChains} />
      <UserBehaviorPanel userProfiles={userProfiles} />
    </div>
  );
}
