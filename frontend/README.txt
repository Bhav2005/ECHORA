ECHORA Frontend v5

ECHORA Frontend v4

ECHORA Frontend v2
===================

Open index.html in VS Code / browser.

Backend endpoints expected by this frontend:
- Identity Service: http://localhost:3001
- Complaint Service: http://localhost:3003

The UI preserves the important API IDs and flows for:
- OTP request / verification
- RSA blind-signature token flow
- complaint submission + evidence upload
- mailbox lookup + anonymous replies
- admin login / queue / reply / status
- public transparency endpoint

Notes:
- Chart.js is loaded from jsDelivr at runtime.
- Transparency charts use backend data when available. The category chart and several experience metrics have clearly-labelled illustrative fallback UI.
- No React build step is required; this remains a single index.html frontend.


v4 visual refinements: compact admin reviewer workspace, custom echo-ripple logo, Fraunces wordmark, and updated brand tagline.

v5: Added restrained micro-interactions, ambient echo motion, page transitions, button ripples, hover depth, selection feedback, refined scrolling, and accessibility-aware reduced motion. Existing layout and functionality were intentionally preserved.