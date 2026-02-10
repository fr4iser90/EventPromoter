# 🚀 Publishing Method System: Roadmap & Strategy

## 🎯 Vision
Ein hochflexibles Publishing-System, das zwischen **Automatisierung (Auto-Modus)** und **voller Kontrolle (Manual Override)** balanciert. Jede Plattform wird technisch identisch behandelt und bietet maximale Transparenz durch Echtzeit-Feedback.

---

## 📂 Projekt-Tasks
Um die Umsetzung übersichtlich zu halten, ist das Projekt in folgende Teilaufgaben unterteilt:

1.  **[Task 1: Header & Globaler FastSwitch](task_1_header.md)** ➔ Globale Steuerung & Store-Anbindung.
2.  **[Task 2: Plattform-Card Badges](task_2_badges.md)** ➔ Interaktive Chips & Local Overrides.
3.  **[Task 3: Settings Modal](task_3_modal.md)** ➔ Priority Queue & Custom Routes.
4.  **[Task 4: Backend Integration](task_4_backend.md)** ➔ Routing-Logik & Fallbacks.

---

## 🛠 1. Die Publishing-Methoden
Das System unterstützt drei primäre Routen für **alle** Plattformen:

| Methode | Icon | Beschreibung | Fokus |
| :--- | :--- | :--- | :--- |
| **n8n Integration** | `🔗` | Webhook-basierte Workflows | Externe Logik & KI-Verarbeitung |
| **Direct API** | `📡` | Direkte Kommunikation via SDK/HTTP | Geschwindigkeit & Stabilität |
| **Playwright** | `🤖` | Browser-Automatisierung | Fallback bei fehlender API / UI-Simulation |

---

## ⚙️ 2. Intelligente Steuerung (Auto-Modus)
Anstatt eines starren Fallbacks nutzen wir ein **Priority Queue Modell**:

*   **Globaler Default:** In den App-Settings wird die Standard-Reihenfolge festgelegt (z.B. `n8n` ➔ `api` ➔ `playwright`).
*   **Logik-Flow:**
    1.  Prüfe, ob die Methode konfiguriert ist.
    2.  Falls ja: Ausführen.
    3.  Falls nein oder Fehler: Automatisch zur nächsten Methode in der Queue springen.

---

## 🎨 3. UI/UX: Interaktives Dashboard
Die Steuerung erfolgt direkt im `PlatformSelector.jsx` über ein Badge-System.

### 🔘 Badge-Matrix & Status
*   **[✨ Auto]**: Folgt der globalen Priorität.
*   **[🔵 Blau]**: Manuell gewählt (Override).
*   **[🟢 Grün]**: Aktiv durch Auto-Prio.

---

## 📊 4. Plattform-Matrix (Standardisierung)
| Plattform | n8n | API | Playwright | Feedback-Level |
| :--- | :---: | :---: | :---: | :--- |
| **Reddit** | ✅ | ✅ | ✅ | Detailed Steps (1-6) |
| **Email** | ✅ | ✅ | ✅ | Detailed Steps |
| **Facebook** | ✅ | ✅ | ✅ | Detailed Steps |
| **Instagram** | ✅ | ✅ | ✅ | Detailed Steps |
| **Twitter** | ✅ | ✅ | ✅ | Detailed Steps |
| **LinkedIn** | ✅ | ✅ | ✅ | Detailed Steps |
