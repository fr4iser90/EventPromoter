# 💼 LinkedIn Credentials

## CREDENTIALS REQUIRED / CREDENTIALS ERFORDERLICH

1. Go to: **https://www.linkedin.com/developers/apps**
2. Create new app
3. You need:
   - **Client ID**
   - **Client Secret**
4. Configure **OAuth Redirect URL**:
   `https://your-n8n-instance.com/rest/oauth2-credential/callback`
5. Request permissions: `w_member_social`, `w_organization_social`

## In n8n:

1. **Settings** → **Credentials** → **Add Credential**
2. Select **LinkedIn OAuth2 API**
3. Enter Client ID and Secret
4. Complete OAuth flow
5. Assign to node: **💼 Post to LinkedIn**

---

**Credential ID:** `LINKEDIN_CREDENTIALS_ID`

*(Doppelklick zum Bearbeiten)*
