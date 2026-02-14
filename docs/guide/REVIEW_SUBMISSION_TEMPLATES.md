# Review Submission Templates

Use these copy-paste templates for platform app reviews. Keep texts short, concrete, and aligned with actual implemented behavior.

Replace placeholders like `<YOUR_DOMAIN>` and `<FEATURE_NAME>` before submission.

Prefilled example for this project:

- `docs/guide/REVIEW_SUBMISSION_V1_EVENTPROMOTER.md`

## 1) Generic Base Template (All Platforms)

## App Description

EventPromoter is a self-hosted event publishing tool that helps authenticated users create and publish event announcements to connected social platforms from one dashboard.

The app supports content drafting, optional media attachments, and controlled publishing workflows.

## Why This Permission Is Needed

We request this permission only to enable users to publish content they explicitly create and approve inside our app.

Without this permission, the platform-specific publish function cannot work.

## User Flow Summary

1. User logs in to EventPromoter.
2. User connects their platform account via OAuth.
3. User creates or edits event content in our editor.
4. User explicitly clicks publish.
5. App publishes the content to the connected account/page/profile.

## Data Handling Summary

- We store only data required for publishing and operational logs.
- We do not sell user data.
- Users can request data deletion at any time.
- Privacy Policy: `https://<YOUR_DOMAIN>/privacy`
- Terms: `https://<YOUR_DOMAIN>/terms`
- Contact: `https://<YOUR_DOMAIN>/contact`
- Data deletion info: `https://<YOUR_DOMAIN>/privacy#data-deletion`

## Reviewer Test Access

Reviewer account:
- Email: `<REVIEWER_TEST_EMAIL>`
- Password: `<REVIEWER_TEST_PASSWORD>`

Optional reviewer instructions:
- Login URL: `https://<YOUR_DOMAIN>/login`
- Demo account/page/profile to connect: `<DEMO_ACCOUNT_INFO>`
- Video walkthrough: `<LINK_TO_SCREENCAST>`

## 2) Permission-to-Feature Mapping Template

Use this section per platform permission/scope request.

| Permission/Scope | Feature in App | Why Required | If Rejected |
|---|---|---|---|
| `<SCOPE_1>` | `<FEATURE_1>` | `<REASON_1>` | `<IMPACT_1>` |
| `<SCOPE_2>` | `<FEATURE_2>` | `<REASON_2>` | `<IMPACT_2>` |

Rules:

- Request minimum scopes only.
- Do not include "future" permissions.
- Make one clear feature mapping per scope.

## 3) Meta (Facebook/Instagram) Template

## Use Case

EventPromoter allows authenticated users to publish event announcements to Facebook Pages and/or Instagram professional accounts they control.

The user explicitly authorizes account access via OAuth and manually triggers each publish action.

## What the App Does With Access

- Reads only account/page identifiers required for publishing.
- Publishes user-created content to authorized destinations.
- Stores publish operation metadata for audit and debugging.

No background posting occurs without user action in the app.

## Why Each Permission Is Required

`<META_SCOPE_1>` is required for `<FEATURE_NAME_1>`.

`<META_SCOPE_2>` is required for `<FEATURE_NAME_2>`.

Without these permissions, posting to authorized assets cannot be completed.

## Reviewer Validation Steps

1. Login using provided reviewer account.
2. Connect Meta account via OAuth.
3. Create a sample event post.
4. Click publish.
5. Verify content appears on test Page/account.

## 4) LinkedIn Template

## Use Case

EventPromoter enables users to publish event announcements to LinkedIn profiles/organizations they are authorized to manage.

Publishing is initiated by explicit user action in the dashboard.

## Scope Justification

`<LINKEDIN_SCOPE_1>` is required for `<FEATURE_NAME_1>`.

`<LINKEDIN_SCOPE_2>` is required for `<FEATURE_NAME_2>`.

We request only minimum scopes needed for posting functionality.

## Compliance Summary

- Public legal pages are available.
- OAuth consent is required before any platform action.
- Data deletion request process is documented.
- Audit logs are maintained for publish actions.

## 5) X (Twitter) Template

## Use Case

EventPromoter allows users to create and post event updates to their connected X accounts after explicit consent and manual publish action.

## Why API Access Is Needed

API access is used to:

- authorize user accounts via OAuth,
- publish user-approved text/media posts,
- capture publish status for reliability and troubleshooting.

## Scope Policy

We request minimum access required for posting and account linking.

No unrelated read scopes are requested unless technically required for account validation.

## 6) Reddit Template

## Use Case

EventPromoter enables users to post event announcements to subreddits they explicitly target and approve.

Users control post content and publish timing in the app UI.

## Why Access Is Needed

Reddit API access is required to:

- authenticate user account via OAuth,
- submit user-approved posts,
- provide delivery status feedback in the app.

## Abuse Prevention

- Rate limiting is enforced.
- Posting is user-triggered.
- We do not perform mass unsolicited posting.

## 7) Data Deletion Text Template

## Data Deletion Policy (Short Form)

Users can request deletion of account-linked data at any time by contacting us at `<SUPPORT_EMAIL>` or via `https://<YOUR_DOMAIN>/contact`.

Upon verified request, we delete stored account linkage, publishing metadata, and related profile data that is not legally required for retention.

Deletion requests are processed within `<X>` days.

## 8) Reviewer Notes Template

Use this block in reviewer comment fields when available.

Reviewer notes:

- App URL: `https://<YOUR_DOMAIN>`
- Privacy Policy: `https://<YOUR_DOMAIN>/privacy`
- Terms: `https://<YOUR_DOMAIN>/terms`
- Contact: `https://<YOUR_DOMAIN>/contact`
- Test account: `<EMAIL/PASSWORD>`
- Screencast: `<URL>`
- Primary publish feature to validate: `<SHORT_FEATURE_NAME>`
- Requested scopes and mapping attached in this submission.

## 9) Common Rejection Avoidance Checklist

- [ ] Scopes exactly match implemented features
- [ ] Legal pages are public and complete
- [ ] OAuth callback URLs are final and reachable
- [ ] Reviewer can fully reproduce publish flow
- [ ] Demo account and instructions are clear
- [ ] No vague "future features" in permission justifications
