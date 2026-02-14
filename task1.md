Ich mache dir jetzt einen echten Security-Review (Backend + Frontend) mit Fokus auf XSS, Secret-Leaks, Auth/Cookies, CORS/Headers und Production-Hardening. Ich scanne zuerst die kritischen Stellen im Code und liefere dir dann priorisierte Findings + konkrete Fixes.

[11 tools called]

Ich habe schon mehrere kritische Punkte gefunden; ich prüfe noch kurz die Preview-Rendering-Komponenten auf XSS-Risiko (`dangerouslySetInnerHTML`/unsanitized HTML), dann gebe ich dir direkt die priorisierte Liste mit konkreten To-dos.

[26 tools called]

## Security Review (Production Readiness)

Hier ist eine **echte Prioritäten-Liste** für dein aktuelles Setup – mit Fokus auf XSS, Credential-Leaks und Server-Hardening.

### Kritische Findings

- **CRITICAL: XSS-Risiko im Preview-Frame (unsanitized HTML + kein iframe sandbox)**
  - Du injectest HTML direkt per `innerHTML`. Wenn irgendwo unsicheres HTML reinkommt, kann Script im Browser laufen.
  
```158:158:frontend/src/shared/components/PreviewFrame.tsx
      mount.innerHTML = document.html
```

- **CRITICAL: `/api/publish/event` ist absichtlich public, aber ohne Signatur/Secret-Check**
  - Jeder kann Events an diesen Endpoint posten (event injection / noise / DoS), solange Session-IDs geraten/erzeugt werden.
  
```4:8:backend/src/middleware/auth.ts
const OPEN_API_ROUTES: Array<{ method?: string; path: string }> = [
  { path: '/health' },
  { path: '/auth/login', method: 'POST' },
  { path: '/publish/event', method: 'POST' }
]
```

```10:21:backend/src/controllers/publishController.ts
  static async ingestEvent(req: Request, res: Response) {
    try {
      const body = req.body || {}
      const sessionId = body.sessionId
      // ...
      if (!sessionId || typeof sessionId !== 'string') {
        return res.status(400).json({
          error: 'Invalid payload',
          message: 'sessionId is required'
        })
      }
```

- **CRITICAL: Session-Secret hat unsicheren Fallback**
  - Wenn kein Secret gesetzt ist, nutzt die App einen statischen Default. Das darf in Prod nie passieren.
  
```46:48:backend/src/services/authService.ts
function getSessionSecret(): string {
  return process.env.AUTH_SESSION_SECRET || process.env.SECRETS_ENCRYPTION_KEY || 'eventpromoter-dev-secret'
}
```

### Hohe Findings

- **HIGH: `helmet` ist definiert, aber im App-Bootstrap nicht aktiviert**
  - Damit fehlen Security-Header (X-Frame-Options/CSP/etc.) effektiv.
  
```26:28:backend/src/index.ts
// 1. Global middleware (CORS, i18n)
app.use(corsMiddleware)
app.use(i18nMiddleware)
```

- **HIGH: Potenzielles Secret-Leak über Logs**
  - n8n webhook URL wird geloggt (wenn Token in URL-Query liegt, ist der Secret im Log).
  - Zusätzlich werden in mehreren Fehlerpfaden `error.message`/`details` direkt an Clients zurückgegeben.

### Mittlere Findings

- **MEDIUM: Kein Rate-Limit auf Login/API**
  - Brute-force auf `/auth/login` möglich, auch allgemein DoS-Risiko.
- **MEDIUM: Kein CSRF-Schutz**
  - Cookie-auth ist da (`httpOnly` gut), aber ohne CSRF-Token/Origin-Validation bleiben Angriffsflächen.
- **MEDIUM: File/CORS Details**
  - In `getFile` ist `Access-Control-Allow-Origin` hart auf `http://localhost:3000` gesetzt (Prod-Mismatch / inkonsistent zur globalen CORS-Policy).
- **MEDIUM: Config-Routen sehr generisch**
  - `/:name` lesen/schreiben ist flexibel, aber braucht strikte Whitelist/Validation für Namen (Hardening).

---

## Was du **sofort** vor Prod machen solltest (Top 8)

1. **Setze harte Secrets (Pflicht):**
   - `AUTH_SESSION_SECRET` (lang, random, nur prod)
   - `SECRETS_ENCRYPTION_KEY` (stabil, backupbar)
2. **Entferne Default-Secret-Fallback** in `authService` (start fail, wenn fehlt).
3. **Schütze `/api/publish/event` mit HMAC/Webhook Secret** (z. B. `X-Event-Signature`).
4. **Aktiviere `helmetMiddleware`** im `backend/src/index.ts`.
5. **Preview härten:**  
   - `iframe sandbox` setzen  
   - HTML sanitizen (z. B. DOMPurify serverseitig oder strikt escapte Renderpfade).
6. **Login rate-limiten** (`express-rate-limit`) + optional lockout/backoff.
7. **Error responses minimieren** (prod nie rohe `message/details` rausgeben).
8. **Logs säubern** (keine URLs mit Tokens, keine secrets in error dumps).

---

## Deine konkrete Frage zu „keine env/creds leaken“

**Aktueller Stand:** besser als vorher (du hast ENV-Fallback entfernt), aber noch **nicht production-safe genug** wegen den Punkten oben (v. a. XSS + public webhook + session secret fallback + fehlendes helmet).

---

Wenn du willst, mache ich als nächsten Schritt direkt einen **Hardening-Patch in einem Rutsch**:
- `helmet` aktivieren,
- `AUTH_SESSION_SECRET` erzwingen,
- `/publish/event` mit Webhook-Signatur absichern,
- Preview-iframe sandboxen,
- einfache Login rate-limit middleware.