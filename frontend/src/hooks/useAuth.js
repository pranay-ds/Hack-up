import { useState, useCallback } from "react";

const AUTH_STORAGE_KEY = "sentinel_auth";
const USERS_STORAGE_KEY = "sentinel_users";

const DEFAULT_USERS = {
  admin: { password: "admin123", role: "admin", name: "Admin User" },
  analyst: { password: "analyst123", role: "analyst", name: "Fraud Analyst" },
  user: { password: "user123", role: "user", name: "Regular User" },
};

function normalizeUsername(username) {
  return String(username || "").trim().toLowerCase();
}

function readStoredUsers() {
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    if (!stored) return { ...DEFAULT_USERS };
    const parsed = JSON.parse(stored);
    if (!parsed || typeof parsed !== "object") return { ...DEFAULT_USERS };
    return { ...DEFAULT_USERS, ...parsed };
  } catch {
    return { ...DEFAULT_USERS };
  }
}

export function useAuth() {
  const [users, setUsers] = useState(readStoredUsers);
  const [session, setSession] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  const login = useCallback((username, password) => {
    const normalizedUsername = normalizeUsername(username);
    const normalizedPassword = String(password || "").trim();
    const u = users[normalizedUsername];
    if (u && u.password === normalizedPassword) {
      const s = { username: normalizedUsername, role: u.role, name: u.name };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(s));
      setSession(s);
      return { ok: true };
    }
    return { ok: false, error: "Invalid credentials" };
  }, [users]);

  const register = useCallback((username, password, role = "user") => {
    const normalizedUsername = normalizeUsername(username);
    const normalizedPassword = String(password || "").trim();

    if (!normalizedUsername) return { ok: false, error: "Username is required" };
    if (normalizedPassword.length < 4) return { ok: false, error: "Password must be at least 4 characters" };
    if (users[normalizedUsername]) return { ok: false, error: "Username already exists" };

    const safeRole = role === "admin" ? "admin" : "user";
    const nextUsers = {
      ...users,
      [normalizedUsername]: {
        password: normalizedPassword,
        role: safeRole,
        name: normalizedUsername,
      },
    };

    setUsers(nextUsers);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));
    const s = { username: normalizedUsername, role: safeRole, name: normalizedUsername };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(s));
    setSession(s);
    return { ok: true };
  }, [users]);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setSession(null);
  }, []);

  return { session, login, logout, register };
}
