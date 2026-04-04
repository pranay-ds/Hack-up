import { useMemo, useState } from "react";
import AppLayout from "./components/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./components/LoginPage";
import { useFraudData } from "./hooks/useFraudData";
import { useHashRoute } from "./hooks/useHashRoute";
import { useAuth } from "./hooks/useAuth";

function AuthenticatedApp({ route, setRoute, session, logout }) {
  const fraudData = useFraudData();
  const [settings, setSettings] = useState({
    blockThreshold: 0.85,
    mfaThreshold: 0.50,
    autoBlock: true,
    emailAlerts: true,
    smsAlerts: false,
  });

  const page = useMemo(() => {
    if (route === "transactions") return <TransactionsPage {...fraudData} session={session} />;
    if (route === "analytics") return <AnalyticsPage {...fraudData} />;
    if (route === "settings") return <SettingsPage settings={settings} setSettings={setSettings} />;
    return <DashboardPage {...fraudData} />;
  }, [route, fraudData, session, settings]);

  return (
    <AppLayout route={route} setRoute={setRoute} streamStatus={fraudData.streamStatus} session={session} onLogout={logout}>
      {page}
    </AppLayout>
  );
}

function App() {
  const { route, setRoute } = useHashRoute();
  const { session, login, logout } = useAuth();

  if (!session) {
    return <LoginPage onLogin={login} />;
  }

  return <AuthenticatedApp route={route} setRoute={setRoute} session={session} logout={logout} />;
}

export default App;
