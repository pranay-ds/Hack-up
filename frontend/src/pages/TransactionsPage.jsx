import TransactionTable from "../components/TransactionTable";
import { TableSkeleton } from "../components/Skeleton";

export default function TransactionsPage({ transactions, overrideDecision, markAsFraud, markAsLegitimate, session, loading }) {
  if (loading) {
    return (
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e5e5" }}>Transactions</div>
        <TableSkeleton rows={10} cols={9} />
      </div>
    );
  }

  return (
    <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#e5e5e5" }}>Transactions</div>
      <TransactionTable transactions={transactions} overrideDecision={overrideDecision} markAsFraud={markAsFraud} markAsLegitimate={markAsLegitimate} session={session} />
    </div>
  );
}
