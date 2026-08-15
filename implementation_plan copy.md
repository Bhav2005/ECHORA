# Implementation Plan: Frontend Premium Redesign Integration

We will transition the Echora frontend to match the design aesthetics, color palette, custom styling, and micro-interactions from the [EchoraDemo.jsx](file:///c:/Users/Bhavana/.gemini/antigravity-ide/scratch/echora/EchoraDemo.jsx) file. All backend API hooks, cryptographic blind-signature flows, and state handling will be preserved.

## Proposed Changes

We will systematically modify the CSS styling and each page/component file.

---

### Global Styling and Theme Setup

#### [MODIFY] [index.css](file:///c:/Users/Bhavana/.gemini/antigravity-ide/scratch/echora/frontend/src/styles/index.css)
- Import external fonts (`Fraunces`, `Work Sans`, `IBM Plex Mono`).
- Add core keyframes for animations (`echoRipple`, `stepEnter`, `chipEnter`, `cardEnter`, `sealPop`, `envelopeBob`, `shine`).
- Define utility classes for the new theme elements (`.ech-step`, `.ech-card`, `.ech-chip`, `.ech-envelope`, `.ech-nav-link`, `.ech-btn-primary`, `.ech-btn-ghost`, etc.).
- Inject the paper-grain texture background globally.

---

### Layout and Navigation

#### [MODIFY] [App.jsx](file:///c:/Users/Bhavana/.gemini/antigravity-ide/scratch/echora/frontend/src/App.jsx)
- Redesign the global container to feature the paper-grain background.
- Integrate the premium navigation header with the `EchoMark` logo/pulse animation, wrapping pages in custom routes using `react-router-dom`.
- Set up a clean footer matching the design tokens.

---

### Grievance Submission Flow

#### [MODIFY] [OtpForm.jsx](file:///c:/Users/Bhavana/.gemini/antigravity-ide/scratch/echora/frontend/src/components/OtpForm.jsx)
- Implement the two-stage wax-seal/OTP entry design.
- Preserve connection to `requestOtp`, `verifyOtp`, `getPublicKey`, and `requestSignature`.
- Retain the local blind-signature cryptographic functions (`getRandomBigInt`, `blindMessage`, `unblindSignature`).

#### [MODIFY] [ComplaintForm.jsx](file:///c:/Users/Bhavana/.gemini/antigravity-ide/scratch/echora/frontend/src/components/ComplaintForm.jsx)
- Integrate the detailed grievance form, featuring custom category chips with minimal inline icons.
- Add building context selection, textarea input, attachment upload styling (with file limit controls), and the "Urgent Attention" checkbox.
- Preserve attachment handlers, success state with `mailboxId` copy capability, and connection to `submitComplaint`.

---

### Echo Tracking (Mailbox)

#### [MODIFY] [CheckMailbox.jsx](file:///c:/Users/Bhavana/.gemini/antigravity-ide/scratch/echora/frontend/src/pages/CheckMailbox.jsx)
- Upgrade the lookup search input and the tracking timeline (stages indicator using the wax seal theme).
- Redesign the message bubble tunnel (distinguishing Administrator vs Anonymous User replies).
- Preserve connection to `checkMailbox` and `sendMailboxReply` APIs.

---

### Administrative Portal

#### [MODIFY] [AdminLogin.jsx](file:///c:/Users/Bhavana/.gemini/antigravity-ide/scratch/echora/frontend/src/pages/AdminLogin.jsx)
- Update the layout and styling of the sign-in card.
- Preserve connection to the `adminLogin` API.

#### [MODIFY] [AdminDashboard.jsx](file:///c:/Users/Bhavana/.gemini/antigravity-ide/scratch/echora/frontend/src/pages/AdminDashboard.jsx)
- Redesign the statistics overview cards.
- Add the custom "volume by category" week-by-week heatmap matrix display.
- Stylize the grievance queue list using interactive row hovers and statuses.
- Upgrade the side inspection modal drawer to show full block hashes, evidence download options, status updates, and the live message tunnel.
- Maintain connections to `getDashboardStats`, `getDashboardComplaints`, and status update endpoints.

---

## Verification Plan

### Automated Tests & Lint Checks
- Compile the Vite production build to verify there are no TypeScript/ESLint or compilation errors:
  ```bash
  cd frontend
  npm run build
  ```

### Manual Verification
- Start the identity, complaint, and frontend services locally.
- Test OTP code issuance, token generation, blind-signature verification, complaint submission, copy Mailbox ID, check mailbox replies, admin portal login, inspect queue, and reply workflow.
