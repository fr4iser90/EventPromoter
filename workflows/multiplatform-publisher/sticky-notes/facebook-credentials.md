# 👤 Facebook Credentials

## CREDENTIALS REQUIRED / CREDENTIALS ERFORDERLICH

1. Go to: **https://developers.facebook.com/**
2. Create **Meta App** (Type: **Business**)
3. Add **Facebook Login** product
4. You need:
   - **App ID**
   - **App Secret**
   - **Page Access Token** (with `pages_manage_posts`)
   - **Page ID** (set as env var `FACEBOOK_PAGE_ID`)

## In n8n:

1. **Settings** → **Credentials** → **Add Credential**
2. Select **Facebook OAuth2 API**
3. Enter credentials
4. Set env var: `FACEBOOK_PAGE_ID=your_page_id`
5. Assign to node: **👤 Post to Facebook Page**

---

**Credential ID:** `FACEBOOK_CREDENTIALS_ID`

*(Doppelklick zum Bearbeiten)*
