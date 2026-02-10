# 🧠 Task 4: Backend Integration & Logic

## 🎯 Ziel
Anpassung des `PublishingService.ts`, um die neuen Prioritäten und Overrides bei jedem Publishing-Vorgang korrekt auszuwerten.

## 🛠 Teilaufgaben
- [ ] **Request-Schema erweitern:**
    - `PublishRequest` muss nun optionale Overrides pro Plattform enthalten.
- [ ] **Priority-Logik in `PublishingService.publish`:**
    - Implementierung der Schleife, die die Priority Queue abarbeitet.
    - Handling von Fallbacks (wenn Methode A scheitert, versuche Methode B).
- [ ] **Event-Streaming Update:**
    - Das `PublisherProgress` muss über das Event-System erfahren, welcher Weg (`method`) letztlich gewählt wurde, um das korrekte Badge anzuzeigen.
- [ ] **ConfigService Integration:**
    - Laden der globalen Prio-Liste und der Custom-Routes aus der Datenbank/Config.

---
🔙 Zurück zur [Roadmap](task.md)
