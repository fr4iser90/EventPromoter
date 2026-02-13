Ja — aber **nicht als Big-Bang**, sondern als kontrollierte Migration.  
Du musst einiges grundlegend vereinheitlichen, aber du kannst es in kleinen sicheren Schritten machen.

## Ziel in 1 Satz
Ein einziges fachliches Orchestrierungsmodell fuer alle Wege (`api`, `playwright`, `n8n`) mit stabilen Step-IDs und immer denselben 4 Signalen:
`step_started`, `step_progress`, `step_completed`, `step_failed`.

## Master-Plan (komplett, pragmatisch)

### Phase 0: Architektur festziehen (1x Entscheidung)
- Step-IDs finalisieren (ohne `step1_`, ohne Nummern).
- Event-Contract fixieren (Pflichtfelder, Fehlercodes, Retryable-Regeln).
- Scope trennen:
  - `publish.*` = Posting
  - `metrics.*` = Views/Analytics (separater Flow)

**Output:** `STEP_NAMES.md` + `EVENT_CONTRACT.md`

---

### Phase 1: Gemeinsame Infrastruktur bauen
- Generische `runStep(...)` Utility im Backend (method-agnostisch).
- API:
  - `runStep({ platform, method, stepId, fn, ... })`
  - auto emit start/completed/failed
  - optional progress helper
- Standardisierte `errorCode`-Mapping-Funktion zentral.

**Output:** ein Runner, den alle Publisher nutzen koennen.

---

### Phase 2: Reddit Playwright als Referenz migrieren
- Aktuelle Reddit-Steps auf neue IDs mappen:
  - `auth.login_check`
  - `compose.open_editor`
  - `compose.fill_content` (oder granularer split)
  - `publish.submit`
  - `publish.verify_result`
- `verify_result` als **echten** eigenen Step einfuehren.
- Fehlerpfade konsequent auf `step_failed` bringen.

**Output:** erster sauberer End-to-End Goldstandard.

---

### Phase 3: Email API + Email Playwright angleichen
- Nummerierte Dateinamen entfernen (`step1_...` etc.).
- Fachliche Step-Dateien:
  - `validateCredentials.ts`
  - `extractRecipients.ts`
  - `renderTemplate.ts`
  - `sendEmail.ts`
  - `verifyResult.ts`
- Beide Modi (`api` + `playwright`) auf identische Step-IDs bringen.

**Output:** gleiche Fach-Events trotz unterschiedlicher Technik.

---

### Phase 4: Restliche Playwright-Plattformen (twitter/facebook/linkedin/instagram)
- Monolithische `publish()`-Flows in Steps schneiden.
- Mindestkette fuer alle:
  - `auth.login_check`
  - `compose.open_editor`
  - `compose.fill_content`
  - `media.upload` (optional)
  - `publish.submit`
  - `publish.verify_result`

**Output:** keine Sonderlogik mehr im Frontend fuer Plattform A/B.

---

### Phase 5: API-Publisher vereinheitlichen
- API-Publisher auf dieselbe Step-Taxonomie mappen.
- Keine losen `error`-Events mehr statt `step_failed`.
- `progress` nur dort, wo wirklich sinnvoll (Uploads, Retries).

**Output:** API wirkt wie Playwright in SSE, nur schneller/stabiler.

---

### Phase 6: n8n sauber integrieren (1 Ingress bleibt)
- Ein Webhook bleibt (`dj-event`), intern routing via platform/subworkflow.
- n8n sendet Step-Callbacks ans Backend (`/api/publish/event`) **oder** liefert `events[]` am Ende.
- n8n nutzt exakt dieselben Step-IDs + Signaltypen.

**Output:** n8n ist voll transparent ohne Webhook-Explosion.

---

### Phase 7: Metrics-Flow separat
- Neuer eigener Ablauf (nicht Publish blockieren):
  - `metrics.fetch_post`
  - `metrics.fetch_views`
  - `metrics.fetch_engagement`
  - `metrics.sync`
- Triggerbar nach Publish oder zeitgesteuert.

**Output:** Views/Analytics sauber getrennt von Posting-Erfolg.

---

### Phase 8: UI/Observability/Tests
- Frontend zeigt nur Step-ID + Status + Message (technikneutral).
- Contract-Tests fuer Event-Schema.
- 2-3 E2E Tests pro Modus (api/playwright/n8n).

**Output:** stabile Releases, weniger Debug-Haos.

## Was du **konkret zuerst** tun solltest (diese Woche)
1. `STEP_NAMES.md` final v1 schreiben  
2. `runStep(...)` zentral implementieren  
3. Reddit Playwright auf v1 komplett sauber ziehen (inkl. `publish.verify_result`)  
4. Dann Email API/Playwright migrieren  

## Aufwand realistisch
- Architektur + Runner: 1-2 Tage  
- Reddit sauber: 0.5-1 Tag  
- Email beide Modi: 1-2 Tage  
- Rest Plattformen: 2-4 Tage  
- n8n Callback + Tests: 1-2 Tage  

Wenn du willst, mache ich dir als naechstes direkt eine **fertige v1 Step-ID-Liste** (copy-paste-ready fuer `STEP_NAMES.md`) plus `errorCode`-Taxonomie.