# 🎴 Task 2: Plattform-Card Badge-Management

## 🎯 Ziel
Die Badges in den einzelnen Plattform-Karten (`PlatformSelector.jsx`) interaktiv machen, um spezifische Overrides pro Plattform zu ermöglichen.

## 🛠 Teilaufgaben
- [ ] **Refactoring `PlatformSelector.jsx`:**
    - Umwandlung der statischen Chips in klickbare Toggle-Buttons.
    - Integration der `platformOverrides` aus dem Store.
- [ ] **Badge-Logik:**
    - **Klick auf Badge:** Setzt die Methode für diese Plattform fest (Override).
    - **Long Press / Toggle:** Zurücksetzen auf "Auto" (folgt dann wieder der globalen Prio).
- [ ] **Visuelles Feedback:**
    - **Blau:** Manuell gepinnt.
    - **Grün:** Aktiv durch Auto-Modus.
    - **Ausgegraut:** Methode für diese Plattform nicht verfügbar/konfiguriert.
- [ ] **Tooltip-Erweiterung:**
    - Anzeige, *warum* eine Methode gerade aktiv ist (z.B. "Aktiv via Global Auto").

---
🔙 Zurück zur [Roadmap](task.md)
