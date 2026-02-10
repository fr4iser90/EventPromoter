# 🎴 Task 2: Plattform-Card Badge-Management

## 🎯 Ziel
Die Badges in den einzelnen Plattform-Karten (`PlatformSelector.jsx`) interaktiv machen, um spezifische Overrides im **CUSTOM** Modus zu ermöglichen.

## 🛠 Teilaufgaben
- [x] **Refactoring `PlatformSelector.jsx`:**
    - Umwandlung der statischen Chips in klickbare Toggle-Buttons (im CUSTOM Modus).
    - Integration der `platformOverrides` aus dem Store.
- [x] **Badge-Logik:**
    - **Klick auf Badge:** Setzt die Route für diese Plattform fest (Manual Override).
    - **Toggle:** Erneuter Klick entfernt den Override (zurück zu CUSTOM Default).
- [x] **Visuelles Feedback (Outline Design):**
    - **Aktiv (User/System):** Kräftiger 2px Border + Opacity 1.
    - **Inaktiv:** Blass (Opacity 0.4) + 1px Border.
    - **Gesperrt (FORCED):** Sehr blass (Opacity 0.3) + Lock-Icon (🔒).
- [x] **Icons:**
    - ✨ (**AutoAwesome**): System-Wahl im CUSTOM Modus.
    - 👤 (**Person**): Manuelle Wahl (Override).
    - 🔒 (**Lock**): Durch globalen FORCED-Modus gesperrt.

---
🔙 Zurück zur [Roadmap](task.md)
