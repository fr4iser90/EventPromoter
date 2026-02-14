# Auth Accounts Configuration

EventPromoter supports two auth modes:

1. Single-user login via `APP_LOGIN_USER` + `APP_LOGIN_PASSWORD`
2. Multi-account login via dedicated ENV variables per account (recommended for review separation)

No JSON is required.

## Multi-Account ENV Format

```env
APP_LOGIN_REVIEW_REDDIT_USER=review_reddit
APP_LOGIN_REVIEW_REDDIT_PASSWORD=change-me
APP_LOGIN_REVIEW_REDDIT_PLATFORMS=reddit

APP_LOGIN_REVIEW_META_USER=review_meta
APP_LOGIN_REVIEW_META_PASSWORD=change-me
APP_LOGIN_REVIEW_META_PLATFORMS=facebook,instagram

APP_LOGIN_REVIEW_LINKEDIN_USER=review_linkedin
APP_LOGIN_REVIEW_LINKEDIN_PASSWORD=change-me
APP_LOGIN_REVIEW_LINKEDIN_PLATFORMS=linkedin

APP_LOGIN_REVIEW_X_USER=review_x
APP_LOGIN_REVIEW_X_PASSWORD=change-me
APP_LOGIN_REVIEW_X_PLATFORMS=twitter
```

## Environment Example

Set in backend environment:

```env
AUTH_SESSION_SECRET=replace-with-strong-secret
SECRETS_ENCRYPTION_KEY=replace-with-stable-secret-for-encryption
PUBLISH_CALLBACK_SECRET=replace-with-strong-callback-secret
CORS_DISABLE=true
# or: CORS_ORIGINS=https://eventpromoter.example.com
```

## Enforcement

- Frontend platform selector only shows allowed platforms from `/api/auth/me`.
- Backend submit route enforces allowed platform list and returns `403` on violations.
- `POST /api/publish/event` is callback-only and protected by `X-EventPromoter-Callback-Secret`.
