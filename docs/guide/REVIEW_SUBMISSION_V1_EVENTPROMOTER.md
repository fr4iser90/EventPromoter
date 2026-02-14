# Review Submission v1 (EventPromoter)

This is a prefilled v1 submission draft for platform app reviews.

Base domain used: `https://eventpromoter.fr4iser.com`

Replace fields marked with `TODO` before submitting.

## 1) App Identity

- App name: EventPromoter
- Product type: Self-hosted event publishing tool
- Primary domain: `https://eventpromoter.fr4iser.com`
- Primary use-case: Users create and publish event announcements to connected social platforms after explicit confirmation.

## 2) Public URLs (Reviewer-Facing)

- Landing: `https://eventpromoter.fr4iser.com/`
- Privacy Policy: `https://eventpromoter.fr4iser.com/privacy` (TODO: ensure page exists)
- Terms of Service: `https://eventpromoter.fr4iser.com/terms` (TODO: ensure page exists)
- Contact/Imprint: `https://eventpromoter.fr4iser.com/contact` (TODO: ensure page exists)
- Data deletion info: `https://eventpromoter.fr4iser.com/privacy#data-deletion` (TODO: ensure anchor/section exists)

Important:

- Keep legal pages public and reachable.
- If Traefik auth is enabled globally, allow-list legal pages and OAuth callback routes for review.

## 3) Generic App Review Text (Copy-Paste)

## App Description

EventPromoter is a self-hosted event publishing application. It allows authenticated users to draft event content and publish it to connected social platforms from one dashboard.

Users explicitly connect platform accounts via OAuth and manually trigger each publish action.

## Why These Permissions Are Needed

Permissions are requested only to support user-approved publishing features. Without these permissions, EventPromoter cannot post content to connected accounts/pages/profiles.

## User Flow

1. User logs into EventPromoter.
2. User connects a platform account via OAuth.
3. User creates or edits event content.
4. User explicitly clicks publish.
5. EventPromoter publishes content and shows status logs.

## Data Handling Summary

- We store only data required for publishing and operational logs.
- We do not sell user data.
- Users can request data deletion via contact route.
- Privacy: `https://eventpromoter.fr4iser.com/privacy`
- Terms: `https://eventpromoter.fr4iser.com/terms`
- Contact: `https://eventpromoter.fr4iser.com/contact`

## 4) Permission-to-Feature Mapping (Fill Per Platform)

| Scope/Permission | Feature | Reason Needed | If Rejected |
|---|---|---|---|
| TODO | Publish event post | Required to submit user-approved content | Publishing unavailable |
| TODO | Account/page/profile linking | Required to connect authorized destinations | Cannot link account |

Guideline:

- Request minimum scopes only.
- Do not request future/unused permissions.

## 5) Reddit Submission Draft

## Use Case

EventPromoter posts user-approved event announcements to selected subreddits through OAuth-authorized accounts.

## Why Access Is Needed

- Authenticate user account via OAuth.
- Submit approved posts.
- Return publish status to user.

## Abuse Prevention

- User-triggered posting only.
- Basic rate-limit handling is implemented.
- No unsolicited mass posting behavior by default.

## 6) Meta (Facebook/Instagram) Submission Draft

## Use Case

EventPromoter allows users to publish event announcements to Facebook Pages and/or Instagram professional accounts they control.

## Why Permissions Are Needed

Each requested permission maps directly to an enabled publish feature and is required to publish approved content.

## Reviewer Validation Steps

1. Login with reviewer test account.
2. Connect Meta account via OAuth.
3. Create sample event post.
4. Publish from EventPromoter UI.
5. Verify post appears on the authorized destination.

## 7) LinkedIn Submission Draft

## Use Case

EventPromoter enables users to publish event updates to authorized LinkedIn profiles/organizations after explicit user confirmation.

## Scope Justification

Only minimum permissions required for account linking and post publishing are requested.

## Compliance

- Public legal pages available.
- OAuth consent required.
- Data deletion process documented.
- Publish action logs retained for audit.

## 8) X Submission Draft

## Use Case

EventPromoter lets users post event updates to connected X accounts after OAuth consent and manual publish action.

## Why API Access Is Needed

- OAuth account authorization.
- Post submission of approved content.
- Publish status and error handling for reliability.

## 9) Reviewer Access Block (Fill Before Submit)

- Reviewer login URL: `https://eventpromoter.fr4iser.com/login` (TODO: verify exact route)
- Reviewer email: `TODO`
- Reviewer password: `TODO`
- Demo destination account/page/profile: `TODO`
- Screencast URL (2-5 min): `TODO`

## 10) Data Deletion Text (Ready to Use)

Users can request deletion of account-linked data at any time via `https://eventpromoter.fr4iser.com/contact`.

After verification, EventPromoter removes stored account linkage, publish metadata, and related profile data that is not legally required for retention.

Deletion requests are processed within `TODO` days.

## 11) Pre-Submission Checklist

- [ ] Legal pages are public and complete
- [ ] OAuth callbacks are reachable and final
- [ ] Scopes are minimal and mapped to real features
- [ ] Reviewer account and steps are tested
- [ ] Screencast demonstrates exact permission usage
- [ ] Data deletion process is visible and functional
