# STEP_NAMES v1

## Ziel

Diese Spezifikation definiert einheitliche, fachliche Step-IDs fuer das Publishing-System.  
Sie gilt identisch fuer `api`, `playwright` und `n8n`.

Die Step-IDs sind:
- plattformunabhaengig
- technikunabhaengig
- nicht nummeriert
- nicht UI-basiert
- stabil ueber Zeit

## A) Grundprinzip

Ein Step beschreibt eine **fachliche Aktion** im Orchestrierungsablauf.  
Ein Step beschreibt **kein UI-Detail** und **keine Reihenfolgenummer**.

Ein Step ist korrekt, wenn seine Bedeutung bei technischen Refactors gleich bleibt.

Stabile Step-IDs sind erforderlich, damit:
- Monitoring und SSE-Auswertung konsistent bleiben
- Retry-Logik wiederverwendbar bleibt
- API, Playwright und n8n denselben Vertragsrahmen nutzen

## B) Namenskonvention

Format:

`<scope>.<action>`

Regeln:
- nur lowercase
- Trenner ist ein Punkt
- Verb/Action bleibt fachlich, nicht technisch-intern
- keine Sequenznummern (`step1`, `step2`, ...)
- keine UI-Texte (`click_button`, `open_modal`, ...)

Gute Beispiele:
- `common.validate_input`
- `auth.login_check`
- `media.upload`
- `publish.verify_result`

Schlechte Beispiele:
- `step1_validate`
- `Step 3: Enter title`
- `click_submit_button`
- `reddit_step_6`

## C) Zulaessige Scopes

- `common.*`
- `auth.*`
- `compose.*`
- `media.*`
- `publish.*`
- `metrics.*`
- `n8n.*` (nur Orchestrierung, keine fachlichen Publish-Steps)

## D) V1-Step-Liste

Die folgenden Step-IDs sind in v1 freigegeben.

### `common.validate_input`
- Beschreibung: Validiert fachliche Eingabedaten vor Ausfuehrung.
- Pflichtstatus: **mandatory**

### `common.resolve_targets`
- Beschreibung: Ermittelt konkrete Zielobjekte aus Gruppen/Regeln/IDs.
- Pflichtstatus: **mandatory**

### `auth.validate_credentials`
- Beschreibung: Prueft, ob erforderliche Credentials vorhanden und nutzbar sind.
- Pflichtstatus: **mandatory**

### `auth.login_check`
- Beschreibung: Verifiziert Login-Status oder fuehrt Login-Pruefung aus.
- Pflichtstatus: **optional**

### `compose.open_editor`
- Beschreibung: Oeffnet den fachlichen Eingabekontext fuer den Inhalt.
- Pflichtstatus: **optional**

### `compose.fill_content`
- Beschreibung: Fuellt den finalen Inhaltskoerper fuer das Zielsystem.
- Pflichtstatus: **mandatory**

### `compose.render_template`
- Beschreibung: Rendert Vorlagen mit Variablen zu finalem Inhalt.
- Pflichtstatus: **optional**

### `compose.extract_recipients`
- Beschreibung: Ermittelt Empfaenger aus Zieldefinitionen.
- Pflichtstatus: **optional**

### `media.resolve_attachments`
- Beschreibung: Loest Attachment-Referenzen in konkrete Artefakte/URLs auf.
- Pflichtstatus: **optional**

### `media.process_attachments`
- Beschreibung: Verarbeitet Attachments fachlich (z. B. Mapping, Zuordnung, Vorbereitung).
- Pflichtstatus: **optional**

### `media.upload`
- Beschreibung: Laedt Medien in das Zielsystem oder in erforderliche Vorstufen hoch.
- Pflichtstatus: **optional**

### `publish.submit`
- Beschreibung: Fuehrt den fachlichen Veroeffentlichungsbefehl aus.
- Pflichtstatus: **mandatory**

### `publish.verify_result`
- Beschreibung: Verifiziert den fachlichen Publish-Erfolg anhand technischer Resultate.
- Pflichtstatus: **mandatory**

### `metrics.fetch_post`
- Beschreibung: Laedt den Post-Datensatz fuer nachgelagerte Metriken.
- Pflichtstatus: **optional**

### `metrics.fetch_views`
- Beschreibung: Laedt View-Impressions-Metriken.
- Pflichtstatus: **optional**

### `metrics.fetch_engagement`
- Beschreibung: Laedt Engagement-Metriken (z. B. Reaktionen, Kommentare).
- Pflichtstatus: **optional**

### `metrics.sync`
- Beschreibung: Synchronisiert geladene Metriken in den Zielspeicher.
- Pflichtstatus: **optional**

## Abgrenzung

- `publish.*` beschreibt den fachlichen Posting-Erfolg.
- `metrics.*` beschreibt nachgelagerte Analyse und Reporting-Schritte.
- `metrics.*` ist nicht Teil der Publish-Erfolgsdefinition.
- `n8n.*` beschreibt nur Orchestrierungsaktivitaeten innerhalb n8n.
