# Next-Week Execution Plan

## Day 1: Stabilize and validate
- Confirm all services run with the current build
- Fix any port or environment issues
- Add missing `.env.example` files and validate config loading
- Ensure the blind-signature flow works end-to-end

## Day 2: Database and data integrity
- Replace SQLite with PostgreSQL for identity and complaint services
- Add migration scripts for initial schema
- Validate token and complaint data correctness
- Test recovery and basic DB backup flow

## Day 3: Security hardening
- Harden admin auth and sessions
- Review token reuse and OTP expiry logic
- Add upload validation for evidence files
- Add restrictions for complaint content and privacy checks

## Day 4: Admin workflows
- Add complaint status flow
- Add admin reply mailbox functionality
- Improve dashboard actions and visibility
- Test complaint assignment / escalation rules

## Day 5: Deployment setup
- Write Dockerfiles if not already present
- Configure docker-compose for all services
- Prepare production env values and secrets strategy
- Validate local deployment in containers

## Day 6: Production readiness
- Add monitoring, logs, and health checks
- Add CI/CD pipeline for automated build/test/deploy
- Prepare deployment docs and rollback plan
- Run final regression tests

## Day 7: Final launch and handoff
- Deploy staging build
- Validate end-to-end flow in staging
- Fix last issues
- Prepare final demo / presentation / documentation

## Expected outcome by end of week
- deployed app running in a real environment
- secure admin module
- anonymous but verified complaint submission flow
- complaint ledger and dashboard analytics
- operational deployment guide and support notes
