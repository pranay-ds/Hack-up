# Sentinel Fraud Platform - Project Report

## 1) Executive Summary

This project is a live fraud monitoring and decision platform.

In simple terms, it does this:
- Watches incoming payment transactions in real time
- Scores each transaction for fraud risk
- Decides whether to APPROVE, ask for MFA, or BLOCK
- Shows everything on a live dashboard for analysts
- Lets analysts take action from the UI

Current public app link:
- Frontend: `https://hackup-frontend.onrender.com`

Backend API link:
- API: `https://godsec.onrender.com/api/v1`
- Health check: `https://godsec.onrender.com/api/v1/health`


## 2) Business Goal

The goal is to reduce financial fraud losses while keeping genuine customer transactions smooth.

The system balances two needs:
- Catch fraud quickly
- Avoid too many false alarms that frustrate good customers


## 3) What Was Built

### Frontend (analyst dashboard)
- Dark-theme, real-time monitoring interface
- KPI cards (transactions, blocked, MFA, approval, risk, money saved)
- Live charts (velocity, trend, adaptive learning)
- Transaction list + details panel
- Blocked transaction reason drill-down
- Inline MFA review section on dashboard
- Fraud ring/fraud chain panels
- Analyst action buttons (Block / MFA / Safe) with visible state updates
- Login/logout workflow

### Backend (decision API)
- FastAPI service with REST + WebSocket endpoints
- Evaluation endpoint for real-time decisioning
- Health endpoint
- Graph endpoint (for ring visualization)
- Rules + ML decision pipeline
- Async background persistence and event broadcasting

### Deployment
- Frontend deployed on Render static site
- Backend deployed on Render web service
- CORS configured so frontend can securely call backend


## 4) Current Working Status

Production status is healthy:
- Frontend is reachable
- Backend health endpoint responds
- Evaluate endpoint returns decisions
- Dashboard loads with live updates

Recent hardening work completed:
- Fixed logout blank-screen bug
- Fixed non-working analyst buttons
- Added frontend request timeout handling (prevents endless loading)
- Added warmup/degraded banner for slow backend periods
- Improved backend request-path responsiveness


## 5) User Experience Journey (Layman)

1. Analyst opens the app link
2. Dashboard starts showing incoming transactions
3. Each transaction gets a fraud decision (Approve / MFA / Block)
4. Risk charts and alerts update live
5. Analyst can click into details and reasons
6. Analyst can manually override or take action
7. System logs decisions and keeps streaming


## 6) Decision Logic (Simple)

Each transaction passes through:
- Rule checks (hard safety rules)
- ML score (risk probability)
- Final decision policy

Decision outcomes:
- Low risk -> APPROVE
- Medium risk -> MFA
- High risk -> BLOCK

Then the system:
- Sends result back to UI immediately
- Stores result in ledger
- Broadcasts update to live stream


## 7) Key Tech Modules (Non-Technical View)

- `api/` -> "front desk" for all incoming app requests
- `decision_engine/` -> "brain" that decides fraud verdicts
- `rules/` -> "hard guardrails"
- `models/` -> "ML scoring"
- `storage/` -> "permanent record keeping"
- `frontend/` -> "live control room dashboard"


## 8) Reliability and Risk Notes

What is good now:
- App is publicly reachable
- Fallback behavior exists for temporary backend slowness
- UI remains usable even when stream quality varies

Known practical constraints:
- Render free/shared infrastructure can add cold-start latency
- Evaluate response can occasionally spike around ~1 second+


## 9) Security and Operations Notes

- API tokens were used during deployment operations; they should be rotated if not already rotated.
- Public sharing should use only the frontend URL.
- Backend URL is for system integration/health checks.


## 10) What Is Intentionally Not Active

- SAL (Stake-Aware Learning) integration is not active in production decision flow.
- It was evaluated and then reverted by request.


## 11) Recommended Next Steps

1. Add staging environment before production auto-deploy
2. Add monitoring for p50/p95 latency and error rate
3. Tune fraud threshold with business targets (false positives vs missed fraud)
4. Add custom domain for branding
5. Add CI pipeline (build + tests on each pull request)


## 12) One-Line Summary

Sentinel is now a deployable, real-time fraud operations platform where analysts can monitor, investigate, and act on fraud signals from a single live dashboard link.
