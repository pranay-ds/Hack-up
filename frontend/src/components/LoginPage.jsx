import { useState, useCallback } from "react";

const USERS = {
  admin: { password: "admin123", role: "admin", name: "Admin User" },
  analyst: { password: "analyst123", role: "user", name: "Fraud Analyst" },
  user: { password: "user123", role: "user", name: "Regular User" },
};

export function useAuth() {
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem("sentinel_auth");
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = useCallback((username, password) => {
    const u = USERS[username];
    if (u && u.password === password) {
      const s = { username, role: u.role, name: u.name };
      localStorage.setItem("sentinel_auth", JSON.stringify(s));
      setSession(s);
      return { ok: true };
    }
    return { ok: false, error: "Invalid credentials" };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("sentinel_auth");
    setSession(null);
  }, []);

  return { session, login, logout };
}

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");
  const [regRole, setRegRole] = useState("user");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === "register") {
      USERS[username] = { password, role: regRole, name: username };
      const result = onLogin(username, password);
      if (!result.ok) setError(result.error);
      return;
    }
    const result = onLogin(username, password);
    if (!result.ok) setError(result.error);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 380, background: "#111", border: "1px solid #1a1a1a", borderRadius: 6, padding: "32px 28px" }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#e5e5e5", marginBottom: 4 }}>SENTINEL</div>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 24 }}>
          {mode === "register" ? "Create Account" : "Fraud Detection Platform"}
        </div>

        {error && (
          <div style={{ fontSize: 11, color: "#f87171", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 3, padding: "8px 12px", marginBottom: 14 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, color: "#666", marginBottom: 4, display: "block" }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} style={inputStyle} placeholder="Username" />
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#666", marginBottom: 4, display: "block" }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} placeholder="Password" />
          </div>
          {mode === "register" && (
            <div>
              <label style={{ fontSize: 11, color: "#666", marginBottom: 4, display: "block" }}>Role</label>
              <select value={regRole} onChange={e => setRegRole(e.target.value)} style={inputStyle}>
                <option value="user">Analyst</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          )}
          <button type="submit" style={primaryBtn}>{mode === "register" ? "Register" : "Sign In"}</button>
        </form>

        {mode === "login" && (
          <>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #1a1a1a" }}>
              <div style={{ fontSize: 10, color: "#888", marginBottom: 8 }}>Demo Credentials:</div>
              <div style={{ fontSize: 11, color: "#666", lineHeight: 1.8 }}>
                <div><span style={{ color: "#ccc" }}>admin</span> / admin123</div>
                <div><span style={{ color: "#ccc" }}>analyst</span> / analyst123</div>
                <div><span style={{ color: "#ccc" }}>user</span> / user123</div>
              </div>
            </div>
            <button type="button" onClick={() => { setMode("register"); setError(""); }} style={{ ...linkBtn, marginTop: 12 }}>
              Create new account
            </button>
          </>
        )}
        {mode === "register" && (
          <button type="button" onClick={() => { setMode("login"); setError(""); }} style={{ ...linkBtn, marginTop: 12 }}>
            Back to login
          </button>
        )}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  fontSize: 13,
  background: "#0f0f0f",
  border: "1px solid #1a1a1a",
  borderRadius: 3,
  color: "#e5e5e5",
  outline: "none",
  boxSizing: "border-box",
};

const primaryBtn = {
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 600,
  background: "#60a5fa",
  border: "none",
  borderRadius: 3,
  color: "#0a0a0a",
  cursor: "pointer",
};

const linkBtn = {
  padding: "8px 16px",
  fontSize: 12,
  background: "transparent",
  border: "1px solid #1a1a1a",
  borderRadius: 3,
  color: "#666",
  cursor: "pointer",
};
