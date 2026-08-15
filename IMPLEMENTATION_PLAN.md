# Echora Implementation Plan

## 1. Product overview
Echora is an anonymous but verified grievance reporting platform for educational institutions. It allows employees, students, and faculty members to file grievances without revealing their identity, while still proving institutional membership through cryptographic blind signatures.

The platform is designed to provide:
- anonymous complaint submission
- institutional verification without identity exposure
- tamper-evident complaint ledger
- privacy-preserving analytics using k-anonymity
- admin dashboard for triage and monitoring

## 2. Current architecture

### Frontend
- React + Vite
- Handles OTP verification, blind-signature token generation, complaint form, admin dashboard, mailbox checks
- Runs on port 5173

### Identity Service
- Express API on port 3001
- Handles:
  - email OTP request
  - email OTP verification
  - RSA blind signature issuance
  - institutional identity verification without storing personal identity

### Complaint Service
- Express API on port 3002
- Handles:
  - complaint intake
  - ledger/hash chaining
  - dashboard analytics
  - admin replies and mailbox retrieval
  - evidence upload handling

### Database
Current setup uses SQLite fallback and is intended to support PostgreSQL in production.

## 3. What is already implemented
- OTP-based institutional verification flow
- blind signature generation and unblinding on the client side
- anonymous complaint submission with a mailbox ID
- complaint ledger with SHA-256 chaining
- admin dashboard with basic analytics
- k-anonymity gating for privacy-safe reporting
- evidence upload flow

## 4. What still needs to be completed before production

### A. Production database setup
Required:
- PostgreSQL for Identity Service and Complaint Service
- proper schema migration scripts
- database backups and retention policy
- environment-based configuration with secrets

Recommended:
- separate databases for identity and complaints
- connection pooling
- read/write split if the app grows

### B. Authentication and authorization hardening
Required:
- secure admin login with MFA or strong password policy
- secure JWT/session handling
- role-based protections for admin endpoints
- ability to revoke admin sessions

### C. Better identity verification model
Current flow is a proof-of-membership model but should be tightened by:
- institutional email domain validation
- expiry and revocation tracking for issued membership tokens
- token lifecycle management
- preventing re-use of a single valid OTP/session beyond the intended workflow

### D. Data privacy and compliance
Required:
- ensure no direct identifiers are stored in complaint content
- add safe redaction checks before storing complaint text
- add complaint moderator review for sensitive data
- implement retention policies

### E. Admin workflow improvements
Need:
- complaint status transitions with audit log
- assignment to departments or investigators
- escalation rules
- email or notification system for mailbox replies

### F. Storage and file handling
Need:
- secure file storage (object storage preferred)
- malware scan for uploaded evidence
- size/type validation enforcement
- expiry cleanup for uploaded files

### G. Operational monitoring
Add:
- error monitoring and alerting
- request logging
- observability dashboard
- health checking on all services

## 5. Recommended deployment architecture

### Local development
Use:
- frontend: Vite dev server
- identity-service: Node.js service on port 3001
- complaint-service: Node.js service on port 3002
- PostgreSQL container or local database

### Production deployment
Recommended stack:
- Frontend: Vercel / Netlify / Nginx static hosting
- Identity Service: Docker container on a VM or cloud compute
- Complaint Service: Docker container on a VM or cloud compute
- Database: managed PostgreSQL (AWS RDS / Azure Database / Supabase / Neon)
- Object storage: S3-compatible bucket for evidence uploads
- Reverse proxy: Nginx or cloud load balancer
- SSL/TLS: managed certificate via cloud provider or Let's Encrypt

## 6. Recommended deployment topology

```text
User Browser
    |
    v
Frontend (React app)
    |
    +---> Identity Service (OTP + blind signatures)
    |
    +---> Complaint Service (complaints + ledger + admin)
            |
            v
        PostgreSQL
            |
            v
       Evidence Storage
```

## 7. Environment variables
Set variables for each service:

### Frontend
- VITE_IDENTITY_API_URL
- VITE_COMPLAINT_API_URL

### Identity Service
- PORT
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- JWT_SECRET
- NODE_ENV

### Complaint Service
- PORT
- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- NODE_ENV
- UPLOAD_DIR

## 8. Docker deployment plan
Create Dockerfiles for:
- frontend
- identity-service
- complaint-service

Use docker-compose with:
- postgres service
- frontend service
- identity-service service
- complaint-service service

Example service layout:
- frontend connects to complaint and identity APIs through internal network
- complaint-service connects to PostgreSQL
- identity-service connects to PostgreSQL

## 9. CI/CD plan
Add pipeline steps:
1. install dependencies
2. run unit tests
3. run lint/build checks
4. build Docker images
5. push to registry
6. deploy to target environment

Suggested tools:
- GitHub Actions
- Azure DevOps
- GitLab CI

## 10. Security checklist before launch
- enforce HTTPS everywhere
- rotate all default credentials
- use environment secret management
- disable direct public DB access
- restrict admin endpoints with proper auth
- add rate limiting and abuse protection
- validate all file uploads strictly
- review complaint text for PII leaks

## 11. Suggested roadmap

### Phase 1: Stability
- replace SQLite fallback with PostgreSQL in all services
- add real deployment config and env setup
- harden admin auth
- fix all edge cases around token expiry and reuse

### Phase 2: Reliability
- add monitoring, logs, and health checks
- add complaint escalation and status workflows
- build notification and mailbox reply flow

### Phase 3: Production readiness
- secure evidence storage and cleanup policies
- compliance review and privacy controls
- full staging + production deployment pipeline

### Phase 4: Scale and analytics
- advanced dashboard analytics
- export reporting tools
- institutional reporting modules

## 12. Recommended next actions
1. Replace SQLite fallback with PostgreSQL in both services.
2. Add .env.example files and production configuration guides.
3. Secure admin auth and session management.
4. Add Docker deployment and compose setup for all services.
5. Add CI pipeline and staging deployment.
6. Run security review for complaints and evidence uploads.
7. Add moderation and retention policies.

## 13. Final note
The product already has a strong foundation: anonymous verification, tamper-evident ledger, and privacy-aware analytics. The remaining work is mostly about hardening the system for real institutional deployment, security, and operational reliability.
