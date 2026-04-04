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
