# 💾 Task 3: Persistence

## 🎯 Ziel
Sicherstellen, dass der globale Publishing-Modus und die plattformspezifischen Overrides (Badges) dauerhaft gespeichert werden, damit sie nach einem Seiten-Refresh erhalten bleiben.

## 🛠 Teilaufgaben
- [x] **Backend Persistence:**
    - Erweitern der globalen Config (`config/app`), um den `globalPublishingMode` zu speichern. (Via bestehendem Generic Config Controller)
    - Speichern der `platformOverrides` in den User-Preferences. (Via bestehendem Preferences Controller)
- [x] **Store Integration:**
    - Automatisches Senden der Änderungen an `globalPublishingMode` und `platformOverrides` an das Backend (via API Patch).
    - Laden dieser Werte während der `initialize()` Phase im Store.
- [ ] **Consistency Check:**
    - Sicherstellen, dass beim Reset des Workspace auch die temporären Overrides (falls gewünscht) bereinigt werden.

---
🔙 Zurück zur [Roadmap](task.md)
