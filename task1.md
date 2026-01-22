# Plan zur Implementierung der generischen Schema-Architektur

## Ziel
Ein stabiles, deklaratives und generisches Schema-System, das Platzhalter auflöst und Field-Type Enrichments anwendet, ohne dass der Controller oder die Schemas selbst spezielle Logik für einzelne Feldtypen enthalten.

## Komponenten-Rollen

*   **Schemas:** Bleiben deklarativ, enthalten nur Platzhalter (`:platformId`, etc.) und statische Optionen. Keine Runtime-Logik.
*   **SchemaResolver:** Übernimmt Enrichment, Template-Resolution, Default-Werte und Field-Type Enrichments.
*   **SchemaController:** Lädt Schema-Datei, ruft Resolver auf, gibt an Frontend weiter.
*   **Schema-Registry (optional/später):** Lädt alle Schemas einmal zentral, ermöglicht Caching, Validierung, Hot Reload.
*   **Validator (optional/später):** Prüft, dass keine `:placeholder` unersetzt bleibt.

## Umsetzungsschritte

### 1. `backend/src/controllers/schemaController.ts` aktualisieren

*   **`SchemaContext`-Definition:** Definiere den `SchemaContext` Type.
*   **`resolveTemplatesDeep`-Funktion:** Implementiere die rekursive Funktion, die Template-Strings (`:xyz`) basierend auf dem `SchemaContext` auflöst.
*   **`enrichSchema`-Funktion anpassen:**
    *   Akzeptiert `unknown` als Schema-Typ und `SchemaContext` als Kontext.
    *   Erstellt eine tiefe Kopie des Schemas (`structuredClone` oder `JSON.parse(JSON.stringify)`).
    *   Wendet den `resolveTemplatesDeep`-Resolver auf die Kopie an.
    *   **Implementiert Field-Type Enrichments (separat, siehe Punkt 2):** Diese Logik wird hier zentral angewendet, nachdem Templates aufgelöst wurden.
    *   Gibt das angereicherte Schema zurück.
*   **`getSchema`-Methode anpassen:**
    *   Erstellt ein `SchemaContext`-Objekt (`{ platformId: req.params.platformId, ... }`).
    *   Übergibt das geladene Schema und den `SchemaContext` an `enrichSchema`.

### 2. Implementierung von Field-Type Enrichments im `SchemaResolver` (innerhalb `enrichSchema`)

Um eine generische Lösung zu schaffen, werden Field-Type Enrichments in `enrichSchema` angewendet, die alle Felder durchläuft und basierend auf ihrem `type` spezifische Eigenschaften hinzufügt oder modifiziert.

*   **Generische Enrichment-Logik:** Erstelle eine Funktion, die über alle Felder des Schemas iteriert (ähnlich dem früheren `processFields`).
*   **Anwendung der Regeln:** Für jeden `field.type` werden die entsprechenden Regeln angewendet:
    *   `target-list`: `optionsSource.valuePath = 'id'` (falls nicht explizit gesetzt)
    *   `multiselect`: `optionsSource.valuePath = 'id'` (falls nicht explizit gesetzt)
    *   `date`: `format = 'YYYY-MM-DD'` (falls nicht explizit gesetzt)
        *   **Hinweis:** Dies ist ein Frontend-Enrichment und sollte nur hinzugefügt werden, wenn der Backend-Enricher eine klare Grenze hat, was er tut und was das Frontend erwartet. Für Backend-Konsistenz können wir es hinzufügen.
    *   `email`: `validation = /^[^\s@]+@[^\s@]+\.[^\s@]+$/` (falls nicht explizit gesetzt)
        *   **Hinweis:** Dies ist ebenfalls ein Frontend-relevant und sollte mit Vorsicht behandelt werden.
    *   `text`: `trim = true` (falls nicht explizit gesetzt)
    *   `number`: `min = 0, max = 100` (falls nicht explizit gesetzt)
    *   `tel`: `validation = /^\+?[0-9]{7,15}$/` (falls nicht explizit gesetzt)
    *   `checkbox`: `default = false` (falls nicht explizit gesetzt)

### 3. Anpassung bestehender Schemas

*   **Alle Schemas:** Sicherstellen, dass alle Schema-Dateien (z.B. `editRecipientSchema.ts`, `editGroupSchema.ts`, `panel.ts`) **ausschließlich `default export` verwenden**.
*   **Entfernen von direkten `id`s:** Überprüfen, ob `field.id`, `target.id`, `list.id`, `relation.id`, `source.id` entfernt wurden und nur noch `name` verwendet wird, wo es semantisch passt.
*   **Platzhalter verwenden:** Überprüfen, ob alle dynamischen Teile in Endpunkt-URLs als Platzhalter (`:platformId`) definiert sind.

### 4. Optional (spätere Phasen)

*   **Schema-Registry:** Implementierung eines zentralen Dienstes zum Laden, Caching und Validieren von Schemas.
*   **Validator:** Implementierung eines Validators, der nach dem Enrichment prüft, ob alle `:placeholder`s aufgelöst wurden und die Schemas gültig sind.

1️⃣ Schema vs Daten

Schema → definiert Struktur, Felder, Typen, Platzhalter, OptionsSources

Daten → die eigentlichen Werte für die Felder (email, firstName, lastName, Listenitems, Target-Lists etc.)

Das Schema enthält keine Daten, sondern nur wie die Daten aussehen / abgefragt werden sollen.

2️⃣ Ablauf im Frontend

Frontend lädt das Schema vom Backend (/api/platforms/:platformId/schemas/:schemaId)

Das Schema ist schon „gefüllt“ mit Defaults und Enrichments

Alle :placeholders wie :platformId sind ersetzt

Das Schema sagt dem Frontend, wie es Daten holen soll:

z. B. field.optionsSource.endpoint = "/api/platforms/email/targets"

Frontend macht dann ein separates GET auf diesen Endpoint, um die Options oder Target-Liste zu laden

Formular oder Panel rendert die Felder, sobald Daten vom Backend zurückkommen

Frontend               Backend
    |                     |
    |--- GET Schema ----> |
    |                     |
    | <--- Enriched Schema|
    |                     |
    |--- GET Options ---->|
    |                     |
    | <--- Options Data --|
    |                     |
Render Form with Data
