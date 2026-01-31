# Roadmap: Sichtbares Hybrid-Modell für Anhänge

## 1. Architektur-Leitsatz
> "Globale Wirkung braucht explizite Zustimmung."

## 2. Datenmodell & Security Layer

### File-Referenz (Zentrale Wahrheit)
```typescript
interface UploadedFileRef {
  id: string;
  filename: string;
  type: string;
  visibility: "internal" | "public"; // Default: internal
  tags?: string[];
}
```

### Content-Struktur (Plattform-Level)
```typescript
{
  globalFiles: string[]; // IDs von public Files
  _templates: [
    {
      id: string,
      templateId: string,
      targets: any,
      specificFiles: string[] // IDs (internal oder public)
    }
  ]
}
```

---

## 3. Implementierungs-Phasen

### Phase 1: Schema-Erweiterung (File Store) [Prio 1]
* **Ziel:** Visibility-Status einführen.
* **Tasks:**
  * Update `backend/src/types/index.ts` (oder wo FileRefs definiert sind).
  * Backend-Logik beim Upload: Setze Default auf `internal`.
  * Migration: Alle bestehenden Dateien initial auf `internal` setzen.

### Phase 2: Backend-Publisher (Merge & Validation) [Prio 2]
* **Ziel:** Deterministische Mail-Pakete schnüren.
* **Logik:** `merge(global, specific) -> deduplicate`.
* **Hard-Validation:**
  * `globalFiles` enthält `internal` -> **Hard Error** (Publish blockiert).
  * `specificFiles` enthält `internal` -> **OK**.

### Phase 3: Datenmodell-Update (Editor & Store)
* **Ziel:** Trennung von `globalFiles` und `specificFiles` im Frontend-Store.
* **Tasks:**
  * Reducer-Logik für `ADD_GLOBAL_FILE` und `ADD_SPECIFIC_FILE`.
  * Synchronisation mit dem Backend-Schema.

### Phase 4: UI-Umbau (Template-Modal)
* **Ziel:** Die "Summenanzeige" (Standard vs. Spezifisch).
* **UX:**
  * Standard-Files: Checkbox an, disabled, Tooltip: "Global gesetzt".
  * Spezifische Files: Checkboxen für alle anderen kompatiblen Dateien.

### Phase 5: UI-Umbau (Globaler Block)
* **Ziel:** Filterung und Warn-Mechanik.
* **UX:**
  * Zeige nur `public` Dateien standardmäßig.
  * Drag & Drop einer `internal` Datei öffnet den "Bewusst-Machen"-Dialog: *"Datei als public markieren und global anhängen?"*

---

## 4. Edge-Cases & Absicherung
* **Status-Änderung:** Was passiert, wenn eine Datei in `globalFiles` liegt und später auf `internal` gesetzt wird?
  * *Lösung:* Backend-Validation beim Publish fängt das ab (Hard Error). UI zeigt im Editor ein Warn-Icon am Block.
* **Mehrfache Nennung:** Datei ist global UND spezifisch gewählt?
  * *Lösung:* Eindeutige Liste durch `dedupeById` beim Mergen.
