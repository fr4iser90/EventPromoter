# API Access Readiness Checklist

This checklist helps you prepare EventPromoter for official API access requests and app reviews.

Use it as a practical rollout plan for a small self-hosted setup that still needs platform approvals.

Companion templates:

- `docs/guide/REVIEW_SUBMISSION_TEMPLATES.md`
- `docs/guide/REVIEW_SUBMISSION_V1_EVENTPROMOTER.md`

## 1) Global Prerequisites (All Platforms)

### Publicly reachable basics

- [ ] HTTPS domain is reachable from the public internet
- [ ] Landing page is publicly accessible
- [ ] Privacy Policy page is publicly accessible
- [ ] Terms of Service page is publicly accessible
- [ ] Contact/Imprint page is publicly accessible
- [ ] OAuth callback URLs are reachable and stable

### Product/compliance basics

- [ ] Clear app description (what it does, for whom, why)
- [ ] Minimal-scope principle documented (request only required permissions)
- [ ] Data deletion process documented (how a user requests deletion)
- [ ] Retention policy documented (what is stored and for how long)
- [ ] Review demo material prepared (video + test flow + test account)

### Operational basics

- [ ] Audit log exists for publishing actions (who posted what and when)
- [ ] Error logging for failed publish attempts
- [ ] Credentials are stored securely (env vars/secrets, not in git)
- [ ] Rate-limit handling and retries are implemented

## 2) Platform-by-Platform Readiness

## Reddit

### Typical difficulty: Low to Medium

- [ ] Register app in Reddit developer console
- [ ] Configure OAuth redirect URIs
- [ ] Request only required scopes
- [ ] Document exact Reddit use-case (posting to owned/authorized targets)
- [ ] Show rate-limit handling in docs/demo

### Suggested first scope strategy

- Start with posting-only behavior your product actually needs.
- Avoid requesting unrelated read scopes in first review.

## Meta (Facebook / Instagram)

### Typical difficulty: Medium to High

- [ ] Create Meta app and connect Business assets where needed
- [ ] Configure valid OAuth redirect URIs (HTTPS, no localhost for production review)
- [ ] Verify business/contact/legal info in app settings
- [ ] Prepare App Review submission per permission/scope
- [ ] Provide screencast proving exact in-app permission usage
- [ ] Provide reviewer test instructions and test credentials if requested

### Critical review expectations

- Permission-to-feature mapping must be explicit.
- Privacy/data deletion pages must be complete and reachable.
- Do not request advanced permissions before basic flow is accepted.

## LinkedIn

### Typical difficulty: High

- [ ] Register app in LinkedIn developer portal
- [ ] Define strict business use-case and target audience
- [ ] Request only minimum product/permission set
- [ ] Prepare strong written justification (why each permission is necessary)
- [ ] Provide end-to-end demo with real UI path

### Practical note

- LinkedIn reviews are stricter for broader/marketing use-cases.
- Start with smallest viable feature set and expand later.

## X (Twitter)

### Typical difficulty: Medium (policy + commercial constraints)

- [ ] Create developer project/app and keys
- [ ] Select an access tier that fits expected volume/features
- [ ] Configure OAuth + callback URLs
- [ ] Implement and document rate-limit-safe behavior
- [ ] Keep scope set minimal

### Practical note

- Technical integration is often straightforward.
- Cost/tier constraints can become the main blocker.

## 3) Architecture Recommendation for Your Current Setup

You can keep EventPromoter mostly private and still satisfy review requirements.

### Public routes (recommended)

- `/` (landing)
- `/privacy`
- `/terms`
- `/contact` (or imprint)
- OAuth callback routes (for platform auth)

### Private routes (recommended)

- Main dashboard/editor/publish UI
- Internal admin endpoints
- Internal worker/ops routes

This allows:

- review-visible legal/compliance surface,
- secure private operation for your actual tooling.

## 4) 30-Day Execution Plan (Practical)

### Week 1: Legal + Public Surface

- [ ] Publish privacy/terms/contact pages
- [ ] Ensure HTTPS and public reachability
- [ ] Freeze callback URLs

### Week 2: OAuth + Minimal Scopes

- [ ] Implement stable OAuth flows
- [ ] Reduce scopes to minimum
- [ ] Document permission-to-feature mapping

### Week 3: Review Assets

- [ ] Prepare 2-5 minute screencast per platform flow
- [ ] Prepare reviewer notes and test account path
- [ ] Prepare deletion/retention explanation

### Week 4: Submission + Hardening

- [ ] Submit first platform reviews (Reddit/Meta or Reddit/X)
- [ ] Add/verify audit and failure logs
- [ ] Handle reviewer feedback quickly and re-submit

## 5) What You Do NOT Need Initially

- Full SaaS multi-tenant user management
- Public open registration for all users
- Complex billing/subscription layer

For API approval, the priority is:

- policy-compliant app surface,
- clear OAuth/use-case mapping,
- minimal permissions,
- and good reviewer documentation.
