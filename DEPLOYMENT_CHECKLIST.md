# Echora Deployment & Completion Checklist

## Goal
Complete the Echora project into a deployable, secure, and usable grievance system within one week.

## Phase 1: Production hardening (Day 1-2)
- [ ] Replace SQLite fallback with PostgreSQL in both services
- [ ] Add `.env.example` files for each service
- [ ] Store actual secrets in local env files and production secret manager
- [ ] Verify all services start cleanly without port conflicts
- [ ] Validate health endpoints for frontend, identity, and complaint services

## Phase 2: Security and auth (Day 2-3)
- [ ] Improve admin login strength and session handling
- [ ] Add rate-limit and abuse protections for complaints and OTP paths
- [ ] Review blind-signature flow for replay protection and token expiry
- [ ] Validate that complaint content doesn’t leak identity information
- [ ] Confirm evidence upload validation and file cleanup rules

## Phase 3: Data and analytics (Day 3-4)
- [ ] Finalize complaint schema and migration scripts
- [ ] Add admin reply mailbox workflow
- [ ] Add status transitions and escalation logic
- [ ] Verify k-anonymity thresholds for categories and departments
- [ ] Validate privacy-safe chart outputs

## Phase 4: DevOps and deployment (Day 4-5)
- [ ] Build Dockerfiles for all services
- [ ] Validate docker-compose startup with PostgreSQL and the app services
- [ ] Confirm API URLs and frontend env values are production-safe
- [ ] Configure reverse proxy and TLS for production
- [ ] Add CI/CD pipeline for build/test/deploy

## Phase 5: Launch readiness (Day 5-7)
- [ ] Run final regression tests for blind-signature flow
- [ ] Test complaint submission end-to-end
- [ ] Test admin login and dashboard access
- [ ] Test mailbox and response flow
- [ ] Run security review of uploaded files and data retention
- [ ] Publish deployment documentation and support guide

## Commands to validate locally
```bash
# install dependencies
npm install

# frontend
cd frontend && npm install && npm run build

# identity service
cd identity-service && npm install && node src/server.js

# complaint service
cd complaint-service && npm install && node src/server.js
```

## Production deployment target
- Frontend: Vercel / Netlify / static host
- Identity service: container on VM or managed app service
- Complaint service: container on VM or managed app service
- Database: managed PostgreSQL
- Storage: S3-compatible object storage for attachments

## Production launch checklist
- [ ] configure HTTPS
- [ ] rotate default passwords and secrets
- [ ] confirm env files are not committed
- [ ] confirm admin account is not default in prod
- [ ] check volume and backup policy
- [ ] verify uptime monitoring is active
- [ ] validate backup restore procedure
