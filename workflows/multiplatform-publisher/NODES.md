Hier ist die **NODES.md ohne Emojis**:

```
Multi-Platform Social Media Publisher - Node Übersicht

TRIGGER NODES (Eingangspunkte)

Formulare & Direkteingaben:
- On form submission - Web-Formular für Event-Erstellung
- Manual File Path Input - Manuelle Dateipfad-Eingabe  
- Read File from Path - Datei von Pfad lesen
- Parse Manual Input (Markdown/Image) - Markdown/Image parsen

API/Webhooks:
- File Upload (PDF/PNG/JPG) - Datei-Upload über HTTP POST
- Webhook Trigger (API) - API Webhook für externe Systeme

VALIDATION & CONTENT PROCESSING (Verarbeitung)

Validierung:
- Validate & Prepare Data - Eingabedaten validieren & vorbereiten
- Validate Platforms - Plattform-Verfügbarkeit prüfen
- Validate URLs - Bild-/Ticket-URLs validieren

Content-Generierung:
- Format Content for Platforms - Content für jede Plattform formatieren
- Generate Hashtags - Hashtags für Plattformen generieren

SOCIAL MEDIA PLATFORMS (Ausgabe)

API-basierte Plattformen:
- Post to Twitter/X - Twitter API (oauth)
- Post to LinkedIn - LinkedIn API (oauth)
- Post to Reddit - Reddit API (http request)

Browser-Automation (Playwright):
- Post to Instagram - Instagram Web-Interface
- Post to Facebook Page - Facebook Web-Interface

Email:
- Send Email - SMTP Email-Versand

RESULT HANDLING (Ergebnisse)

Sammeln & Logging:
- Collect Results - Alle Posting-Ergebnisse sammeln
- Enhanced Logging - Detaillierte Logs & Metriken

Benachrichtigungen (Response):
- Webhook Response - HTTP Response an Aufrufer
- Send Notifications - Discord & Telegram Benachrichtigungen

INFRASTRUCTURE NODES (Workflow-Kontrolle)

Bedingungen (IF-Statements):
- Post to Twitter/X? - Twitter-Posting aktivieren?
- Post to Instagram? - Instagram-Posting aktivieren?
- Post to Facebook? - Facebook-Posting aktivieren?
- Post to LinkedIn? - LinkedIn-Posting aktivieren?
- Send Email? - Email-Versand aktivieren?
- Post to Reddit? - Reddit-Posting aktivieren?

Datenfluss:
- Merge Results - Alle Ergebnisse zusammenführen

STICKY NOTES (Dokumentation)

Übersichten:
- Overview - Workflow-Beschreibung & Features
- Input Format - Eingabe-Format & Beispiele
- Credentials Overview - Credentials-Setup Übersicht

Plattform-Guides:
- Twitter Credentials - Twitter API Setup
- Instagram Credentials - Instagram Graph API Setup  
- Facebook Credentials - Facebook Graph API Setup
- LinkedIn Credentials - LinkedIn OAuth Setup
- Reddit Credentials - Reddit API Setup
- Email Credentials - SMTP Setup

Erweiterte Features:
- Discord & Telegram Setup - Notification-Setup

WORKFLOW-FLOW

TRIGGER → VALIDATION → CONTENT → PLATFORMS → RESULTS → NOTIFICATIONS

STATISTIK

- Gesamt Nodes: 25+ Nodes
- Trigger Optionen: 4 verschiedene Eingänge
- Social Platforms: 6 Plattformen
- Response Optionen: 3 (Webhook, Discord, Telegram)
- Validierungsschritte: 3 Ebenen

WORKFLOW-VARIANTEN

1. Form Input → Plattform-Posting
2. File Input → Parsing → Plattform-Posting  
3. API Webhook → Plattform-Posting
4. Manual Upload → Plattform-Posting
```
