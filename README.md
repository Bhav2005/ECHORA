# Echora - Anonymous but Verified Grievance & Pulse System

Echora is a full-stack web application providing verifiable anonymity for grievance reporting using blind-signature cryptography.

## Architecture

- **Identity Service** (Port 3001): Handles OTP verification and blind token issuance.
- **Complaint Service** (Port 3002): Handles complaint intake, hash chaining, and dashboard analytics.
- **Frontend** (Port 5173): React app for reporting complaints, checking mailboxes, and admin panel.

## Quick Start (with Docker)

```bash
docker-compose up --build
```
