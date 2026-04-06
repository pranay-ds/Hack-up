# Sentinel Architecture (Layman + Diagram Style)

This document explains the architecture in plain language.


## 1) Big Picture

Think of the system as 3 parts:

1. User Interface (what people see)
2. Decision Service (the fraud brain)
3. Storage + Stream (memory + live updates)


## 2) High-Level Diagram

```
[Analyst / User Browser]
          |
          v
[Frontend Dashboard on Render]
          |
          |  API requests + WebSocket
          v
[Backend Fraud API on Render]
          |
          +--> [Rules Engine]
          |
          +--> [ML Scoring Model]
          |
          +--> [Decision Logic: APPROVE / MFA / BLOCK]
          |
          +--> [Decision Ledger (SQLite)]
          |
          +--> [Live Update Queue / Stream]
```


## 3) Transaction Journey (Step-by-Step)

```
User transaction event
    -> Frontend sends transaction to backend /evaluate
    -> Backend runs fraud checks
    -> Backend returns decision immediately
    -> Frontend updates cards/charts/tables
    -> Backend stores decision and broadcasts update
```

In human words:
- A payment comes in
- System checks risk
- System decides
- Analyst sees result live
- Result is logged for audit/history


## 4) Frontend Architecture (Control Room)

Main job:
- Show real-time fraud status in one place

Major blocks:
- Navigation shell (Dashboard / Transactions / Analytics / Settings)
- Live metrics cards
- Real-time trend charts
- Transaction table with drill-down
- Alerts and ring/chain views
- Inline MFA review
- Analyst action controls

Data behavior:
- Polls/sends evaluate requests continuously
- Subscribes to websocket updates when available
- Falls back gracefully if backend is slow


## 5) Backend Architecture (Fraud Brain)

Main job:
- Accept transaction data and return fraud decision quickly

Core endpoints:
- `GET /health` -> service alive check
- `POST /evaluate` -> fraud scoring and decision
- `GET /graph` -> graph/ring data for UI
- `WS /stream` -> live decision stream to dashboard

Decision sequence:

```
Incoming transaction
   -> rules_engine (hard checks)
   -> model_registry (ML score)
   -> decision_engine (final verdict)
   -> response to frontend
   -> async: log + broadcast + optional Kafka produce
```


## 6) Data and Persistence

Primary persistent store in current setup:
- SQLite ledger (`fraud_ledger.db`) for decision history

Optional ecosystem modules available in project:
- Kafka streaming components
- Neo4j graph components
- Retraining scripts

These can be used for fuller distributed mode, but the live deployed demo works without requiring full Kafka/Neo4j runtime.


## 7) Deployment Architecture

```
Public Link
  https://hackup-frontend.onrender.com
        |
        v
Render Static Site (Frontend)
        |
        v
Render Web Service (Backend API)
  https://hackup-api.onrender.com/api/v1
```

Important detail:
- Users open one frontend link.
- Frontend talks to backend behind the scenes.


## 8) Real-Time Behavior

How "live" updates happen:

1. Frontend continuously sends sample/live transactions to `/evaluate`
2. Backend returns decisions
3. WebSocket stream also pushes new decisions to UI
4. UI updates charts, alerts, tables, counters

If backend is temporarily slow:
- UI shows warmup/degraded signal
- UI uses fallback behavior so dashboard does not appear frozen


## 9) Reliability Design (Simple)

- Immediate decision response path is prioritized
- Heavier/non-critical tasks are backgrounded where possible
- Frontend has request timeout protections
- WebSocket reconnect logic is present
- CORS is configured for frontend-to-backend communication


## 10) Security and Access

- App has login gate in frontend
- CORS restricts browser-origin access to approved frontend origin
- Operational tokens should be rotated after setup


## 11) What Is Not in Active Production Path

- SAL module exists in repo but is not active in production decisioning (as requested)


## 12) Plain-English Summary

This architecture is a live fraud command center:
- Frontend = monitoring and analyst actions
- Backend = decision-making engine
- Storage/stream = memory and live movement

A transaction comes in, gets scored, gets a verdict, and appears on screen almost immediately.
