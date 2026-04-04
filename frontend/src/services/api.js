const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1").replace(/\/$/, "");
const WS_URL = import.meta.env.VITE_WS_URL || API_BASE.replace(/^http/, "ws").replace(/\/api\/v1$/, "/api/v1/stream");

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Backend unreachable");
  return res.json();
}

export async function evaluateTransaction(payload) {
  const res = await fetch(`${API_BASE}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || "Evaluation failed");
  }
  return res.json();
}

export async function fetchGraphData() {
  try {
    const res = await fetch(`${API_BASE}/graph`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function connectWebSocket(onMessage, onOpen, onClose) {
  let ws;
  let reconnectTimer;

  const connect = () => {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      if (onOpen) onOpen();
    };

    ws.onclose = () => {
      if (onClose) onClose();
      reconnectTimer = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (onMessage) onMessage(data);
      } catch { /* skip malformed */ }
    };
  };

  connect();

  return () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) {
      ws.onclose = null;
      ws.close();
    }
  };
}
