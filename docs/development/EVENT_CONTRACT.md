# EVENT CONTRACT v1

## Zweck

Dieses Dokument definiert das einzige erlaubte Event-Modell fuer fachliche Orchestrierung.  
Der Vertrag gilt identisch fuer `api`, `playwright` und `n8n`.

## A) Erlaubte Event-Typen

Nur folgende Event-Typen sind als fachliche Statussignale erlaubt:

- `step_started`
- `step_progress`
- `step_completed`
- `step_failed`

## B) Pflichtfelder (alle Event-Typen)

Jedes Event muss folgende Felder enthalten:

- `publishRunId`
- `platform`
- `method` (`api` | `playwright` | `n8n`)
- `step`
- `timestamp`

## C) Zusaetzliche Felder pro Event

### `step_started`
- keine zusaetzlichen Pflichtfelder

### `step_progress`
- `progress`
- `message`

### `step_completed`
- `duration`
- `data` (optional)

### `step_failed`
- `error`
- `errorCode`
- `retryable`

## D) Verbindliche Regeln

1. `error` und `success` sind keine fachlichen Statussignale.
2. Fachlicher Status darf nur ueber Step-Events transportiert werden.
3. Ein Step endet immer in genau einem terminalen Status:
   - `step_completed` oder
   - `step_failed`
4. `step_progress` darf nur waehrend eines laufenden Steps gesendet werden.
5. `metrics.*` darf nie den Publish-Erfolg blockieren.

## Abgrenzungen

### Was kein Publish-Erfolg ist

Folgende Ergebnisse sind kein Kriterium fuer Publish-Erfolg:
- Views
- Impressions
- Engagement-Metriken
- sonstige Analytics

### Unterschied: `publish.verify_result` vs `metrics.fetch_*`

- `publish.verify_result` prueft den fachlichen Erfolg des Publish-Vorgangs.
- `metrics.fetch_*` liest nachgelagerte Kennzahlen aus.
- `metrics.fetch_*` ist analytisch, nicht transaktional fuer den Publish-Erfolg.

## Gueltigkeit

Dieses Dokument ist der verbindliche Vertragsrahmen fuer Event-Semantik im Publishing-Orchestrator.
