import SummaryCards from "../components/SummaryCards";
import AlertsPanel from "../components/AlertsPanel";
import VelocityGraph from "../components/VelocityGraph";
import FraudTrendChart from "../components/FraudTrendChart";
import FraudRingGraph from "../components/FraudRingGraph";
import FraudChainGraph from "../components/FraudChainGraph";
import UserBehaviorPanel from "../components/UserBehaviorPanel";
import AdaptiveLearningPanel from "../components/AdaptiveLearningPanel";
import BlockedTransactionsPanel from "../components/BlockedTransactionsPanel";
import MFAReviewSection from "../components/MFAReviewSection";
import InsightsPanel from "../components/InsightsPanel";
import { CardSkeleton, ChartSkeleton } from "../components/Skeleton";

export default function DashboardPage({ stats, alerts, transactions, mfaTransactions, userProfiles, fraudRings, fraudChains, modelMetrics, loading, overrideDecision, markAsFraud, markAsLegitimate, applyUserAction }) {
  if (loading) {
    return (
      <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div className="section-title">Dashboard</div>
          <div className="section-subtitle">Real-time fraud operations overview and analyst intelligence</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {Array.from({ length: 6 }, (_, i) => <CardSkeleton key={i} />)}
        </div>
        <ChartSkeleton />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <ChartSkeleton /><ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div className="section-title">Dashboard</div>
        <div className="section-subtitle">Real-time fraud operations overview and analyst intelligence</div>
      </div>
      <SummaryCards stats={stats} />
      <AdaptiveLearningPanel modelMetrics={modelMetrics} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <VelocityGraph transactions={transactions} />
        <FraudTrendChart transactions={transactions} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 10 }}>
        <FraudRingGraph fraudRings={fraudRings} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <AlertsPanel alerts={alerts} />
          <InsightsPanel stats={stats} modelMetrics={modelMetrics} alerts={alerts} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 10 }}>
        <FraudChainGraph fraudChains={fraudChains} />
        <UserBehaviorPanel userProfiles={userProfiles} onUserAction={applyUserAction} />
      </div>
      <MFAReviewSection mfaTransactions={mfaTransactions} overrideDecision={overrideDecision} markAsFraud={markAsFraud} markAsLegitimate={markAsLegitimate} />
      <BlockedTransactionsPanel transactions={transactions} />
    </div>
  );
}
