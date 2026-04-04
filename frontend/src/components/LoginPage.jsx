import { useState } from "react";

const DEMO_USERS = [
  { username: "admin", password: "admin123" },
  { username: "analyst", password: "analyst123" },
  { username: "user", password: "user123" },
];

export default function LoginPage({ onLogin, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login");
  const [regRole, setRegRole] = useState("user");

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedUsername = String(username || "").trim().toLowerCase();
    const normalizedPassword = String(password || "").trim();

    if (!normalizedUsername || !normalizedPassword) {
      setError("Username and password are required");
      return;
    }

    if (mode === "register") {
      if (typeof onRegister !== "function") {
        setError("Registration is not available");
        return;
      }
      const result = onRegister(normalizedUsername, normalizedPassword, regRole);
      if (!result.ok) setError(result.error);
      else setError("");
      return;
    }
    const result = onLogin(normalizedUsername, normalizedPassword);
    if (!result.ok) setError(result.error);
    else setError("");
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
                {DEMO_USERS.map((u) => (
                  <div key={u.username}><span style={{ color: "#ccc" }}>{u.username}</span> / {u.password}</div>
                ))}
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
