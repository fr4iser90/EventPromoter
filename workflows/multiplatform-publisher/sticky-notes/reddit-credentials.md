# 🔴 Reddit Credentials

## CREDENTIALS REQUIRED / CREDENTIALS ERFORDERLICH

1. Go to: **https://www.reddit.com/prefs/apps**
2. Click **"create app"**
3. Fill in:
   - **Name**: Your app name
   - **App type**: **"script"**
   - **Redirect URI**: `http://localhost:8080`
4. Note:
   - **Client ID** (under app name)
   - **Client Secret** (only shown once!)
5. Get OAuth Token:
   - Use: https://not-an-aardvark.github.io/reddit-oauth-helper/
   - Token format: `Bearer YOUR_ACCESS_TOKEN`

## In n8n:

1. **Settings** → **Credentials** → **Add Credential**
2. Select **HTTP Header Auth**
3. Configure:
   - **Name**: `Authorization`
   - **Value**: `Bearer YOUR_ACCESS_TOKEN`
4. Assign to node: **🔴 Post to Reddit**

---

**Credential ID:** `REDDIT_CREDENTIALS_ID`

**Reddit Fields:**
- `redditSubreddit`: Required (e.g., "DJs")
- `redditFlair`: Optional
- `redditNsfw`: true/false
- `redditSpoiler`: true/false

*(Doppelklick zum Bearbeiten)*
