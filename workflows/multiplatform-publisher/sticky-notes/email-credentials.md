# 📧 Email (SMTP) Credentials

## CREDENTIALS REQUIRED / CREDENTIALS ERFORDERLICH

### Gmail:
1. Enable **2-Factor Authentication**
2. Go to: **https://myaccount.google.com/apppasswords**
3. Generate **App Password** for "Mail"
4. Use this password (not your regular password)

### SMTP Settings:
- **Host**: `smtp.gmail.com`
- **Port**: `587` (TLS) or `465` (SSL)
- **User**: your-email@gmail.com
- **Password**: App Password (for Gmail)

## In n8n:

1. **Settings** → **Credentials** → **Add Credential**
2. Select **SMTP**
3. Enter SMTP settings
4. Optional: Set `EMAIL_FROM` env var
5. Assign to node: **📧 Send Email**

---

**Credential ID:** `SMTP_CREDENTIALS_ID`

**Other Providers:**
- Outlook: `smtp.office365.com`
- Custom: Use your provider's SMTP settings

*(Doppelklick zum Bearbeiten)*
