# Publishing-Orchestrierung: Einheitliches Step- und Event-Pattern

## 1) Ist-Zustand (kurz)

- `reddit` Playwright ist bereits modular mit Steps und `executeStep(...)`.
- `email` Playwright hat Steps, emittet Events aber noch manuell pro Step.
- `twitter` / `facebook` / `linkedin` / `instagram` Playwright sind noch eher monolithisch (`publish()` ohne einheitlichen Step-Runner).
- n8n nutzt aktuell einen Webhook-Einstieg (`/webhook/dj-event`), nicht mehrere öffentliche Endpoints.

## 2) Zielbild

Ein gemeinsames Event-Modell fuer **alle Modi** (`api`, `playwright`, `n8n`) mit denselben Grundevents:

1. `step_started` - direkt vor einer fachlichen Aktion  
2. `step_progress` - nur bei laengeren Aktionen (Upload, Polling, Retry)  
3. `step_completed` - bei Erfolg inklusive `duration`  
4. `step_failed` - bei Fehler inklusive `errorCode` und `retryable`

Damit bleibt Frontend/SSE vereinheitlicht, egal welche technische Route die Plattform nutzt.

## 3) Einheitliche Liste: Wann welches Event?

### `step_started`
- Immer direkt vor dem eigentlichen Call/Step emitten.
- Enthalten: `platform`, `method`, `step`, `publishRunId`, optionale `message`.

### `step_progress`
- Nur bei Steps > ~2 Sekunden oder mit erkennbaren Teilphasen.
- Typische Faelle: Upload, Retry-Backoff, Polling, Batch-Verarbeitung.
- Enthalten: `progress` (0-100), `message`.

### `step_completed`
- Nach erfolgreichem Abschluss emitten.
- Enthalten: `duration`, optional `data` (z. B. `postId`, `url`).

### `step_failed`
- Bei Fehler emitten und Step sofort beenden.
- Enthalten: `error`, `errorCode`, `retryable`, `publishRunId`.

## 4) Einheitliche Step-Namenskonvention

Format:

`<scope>.<action>`

Beispiele:
- `common.validate_input`
- `common.resolve_targets`
- `api.upload_media`
- `api.create_post`
- `playwright.login`
- `playwright.fill_form`
- `playwright.submit`
- `n8n.route_platforms`
- `n8n.execute_subworkflow`

Regel:
- Kurz, technisch eindeutig, wiederverwendbar zwischen Plattformen.
- Keine UI-Texte als Step-ID; User-Text kommt ueber `message`.

## 5) n8n mit nur einem Webhook: Warum das reicht

Ein Webhook ist nur der **Ingress** (Transport), nicht die Step-Quelle.

- Eingang: `/webhook/dj-event`
- Routing intern in n8n per `publishTo`/`platform` (Switch/IF/Sub-Workflow)
- Step-Kontext ueber Daten:
  - `publishRunId`
  - `sessionId`
  - `platform`
  - `step`
  - `status`

### Rueckkanal-Optionen

1. **Live (empfohlen)**  
   n8n sendet pro Step Callback an Backend (z. B. `/api/publish/event`), Backend streut via SSE.

2. **Batch/Finale Antwort**  
   n8n liefert am Ende ein `events[]`/`steps[]`-Array zurueck.

Fazit: Du brauchst **nicht** viele Webhooks, um Step-Transparenz zu bekommen.

## 6) Umsetzungsplan (priorisiert)

1. Generische `runStep(...)` Utility in `backend/src/services` bauen (method-agnostisch).
2. `email` und `reddit` auf dieselbe Utility konsolidieren.
3. Monolithische Playwright-Publisher in klare Steps schneiden.
4. API- und n8n-Pfade auf dieselbe Step-Namenskonvention mappen.
5. `STEP_NAMES.md` dokumentieren: erlaubte Step-IDs, Event-Regeln, `errorCode`-Taxonomie.

## 7) Entscheidungsvorlage (kurz)

- **Ja**: ein gemeinsames Event-Modell fuer `api`/`playwright`/`n8n`.
- **Ja**: ein oeffentlicher n8n-Ingress-Webhook.
- **Ja**: interne n8n-Subflows pro Plattform.
- **Nein**: viele oeffentliche Webhooks ohne klare Auth/Tenant/SLA-Gruende.

## 8) Reddit-Backlog (Abarbeitung mit Checkboxen)

### PR 1: Step-IDs und Runner-Vertrag stabil machen

- [ ] Reddit-Step-Mapping auf v1-Step-IDs final festlegen (ohne `Step 1...6`)
- [ ] In Reddit-Publisher nur noch stabile Step-IDs verwenden
- [ ] `subreddit`-Kontext aus Step-Namen entfernen und in `message`/`data` legen
- [ ] Reddit-`executeStep(...)` so anpassen, dass immer `step_started` + `step_completed` + `step_failed` korrekt emittiert werden
- [ ] Bei Step-Fehlern immer `errorCode` und `retryable` setzen
- [ ] Sicherstellen, dass jeder gestartete Step genau einmal terminal endet (`completed` oder `failed`)

### PR 2: Fachliche Vollstaendigkeit fuer Publish herstellen

- [ ] `auth.validate_credentials` als echten Step vor Browser-Flow setzen
- [ ] `common.validate_input` als echten Step vor Browser-Flow setzen
- [ ] `common.resolve_targets` als echten Step vor Browser-Flow setzen
- [ ] `publish.submit` klar als eigener Schritt markieren
- [ ] `publish.verify_result` als eigenen Schritt einfuehren und verpflichtend ausfuehren
- [ ] Dry-Mode-Kriterien fuer `publish.verify_result` explizit definieren

### PR 3: Fehlercodes und Event-Hygiene vereinheitlichen

- [ ] Reddit-v1-ErrorCodes festziehen (mindestens: `MISSING_CREDENTIALS`, `INVALID_INPUT`, `NO_TARGETS_RESOLVED`, `LOGIN_FAILED`, `CONTENT_FILL_FAILED`, `SUBMIT_FAILED`, `VERIFY_FAILED`, `RATE_LIMITED`, `NETWORK_ERROR`, `UNKNOWN_ERROR`)
- [ ] Mapping-Regeln fuer `retryable` pro ErrorCode dokumentieren
- [ ] `error`/`success` nur als Zusatzinfo nutzen, nicht als fachlichen Status
- [ ] Event-Payloads gegen `docs/development/EVENT_CONTRACT.md` pruefen

### PR 4: Abnahme und Regression-Schutz

- [ ] Log/SSE-Pruefung: Pflichtfelder in jedem Event vorhanden (`publishRunId`, `platform`, `method`, `step`, `timestamp`)
- [ ] Verify, dass keine nummerierten Step-Namen mehr emittiert werden
- [ ] Verify, dass `publish.verify_result` bei jedem Publish-Pfad kommt
- [ ] Verify, dass `metrics.*` den Publish-Erfolg nicht blockiert
- [ ] Kurze Test-Notizen in `docs/development` ergaenzen (nur Vertragserfuellung, keine Implementierungsdetails)

## 9) Definition of Done (Reddit v1)

- [ ] Reddit emittiert nur vertragstreue fachliche Step-Events
- [ ] Step-IDs sind stabil, nicht nummeriert, nicht UI-basiert
- [ ] `publish.verify_result` ist verpflichtend und laeuft konsistent
- [ ] Fehlerpfade sind ueber `step_failed` + `errorCode` + `retryable` standardisiert
- [ ] Event-Verhalten ist kompatibel zu `STEP_NAMES.md` und `EVENT_CONTRACT.md`