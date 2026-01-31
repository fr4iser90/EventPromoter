# Analyse & Planung: Platform UI/UX Refactoring (Modal-driven Settings)

## 1. Zielsetzung
Das Frontend wird auf ein Full-Width Layout umgestellt. Die plattformspezifischen Sidebars (Panels) werden entfernt und stattdessen in das bestehende `SettingsModal` integriert. Dieses Modal erhält Tabs **im Header**, um zwischen "Ziele & Optionen" (ehemals Panel) und "Zugangsdaten" (ehemals Settings) zu wechseln. Im Backend werden lediglich die Schema-Keys umbenannt, die Struktur bleibt identisch.

## 2. Schema Refactoring (Backend - NUR RENAME)
Umbenennung der Keys in der `PlatformSchema` und den zugehörigen Typen. Die interne Struktur der Objekte bleibt zu 100% erhalten. JSDoc-Kommentare dürfen NIEMALS gelöscht werden.
- `settings` (alt) -> **`credentials`** (Zugangsdaten/API)
- `panel` (alt) -> **`settings`** (Ziele/Optionen/Gruppen)

### 2.1 Backend Änderungen (Strikte Vorgabe)
1.  **Typen:** `backend/src/types/schema/`
    - `SettingsSchema` Interface umbenennen zu `CredentialsSchema`.
    - `PanelSchema` Interface umbenennen zu `SettingsSchema`.
    - **Wichtig:** Keine neuen Interfaces erfinden. Struktur 1:1 kopieren.
2.  **Validator:** `backend/src/utils/schemaValidator.ts` auf neue Keys anpassen.
3.  **Controller:** `PlatformController.ts` nutzt `credentials` und `settings`.
4.  **Plattformen:** In allen `index.ts` der Plattformen die Keys umbenennen. **JSDoc-Header müssen exakt so bleiben wie sie sind.**

## 3. Frontend Refactoring (UI/UX)

### 3.1 Layout (Full-Width)
- **HomePage.jsx:** Entfernen der Sidebar-Komponenten (`LeftPanel`, `RightPanel`). Der Hauptinhalt nutzt die volle Breite (`maxWidth: 1200px`).

### 3.2 Das neue tab-basierte Modal (Design)
Die Tabs befinden sich **oben im Header** des Modals (MUI DialogTitle Bereich). Der Inhalt ist scrollbar.

---

## 4. Detaillierte Modal-Visualisierungen (Plattform-spezifisch)

### 4.1 EMAIL MODAL
```text
+-----------------------------------------------------------+
| [Email Icon] Email Configuration                        X |
+-----------------------------------------------------------+
|  [ Settings Icon ] Settings          [ Key Icon ] Credentials |
+-----------------------------------------------------------+
|                                                           |
|  TAB: SETTINGS (ehemals Panel)                            |
|  -------------------------------------------------------  |
|  [ SEARCH: Search recipients... ]        [ + NEW RECIPIENT ] |
|  +-------------------------------------------------------+|
|  | Email Address       | First Name | Last Name | B-Day  ||
|  +---------------------+------------+-----------+--------+|
|  | info@event.de       | Max        | Musterm.  | 01.01. ||
|  | test@web.de         | Erika      | Schmidt   | 05.05. ||
|  +-------------------------------------------------------+|
|                                                           |
|  [ SEARCH: Search groups...     ]        [ + NEW GROUP     ] |
|  +-------------------------------------------------------+|
|  | Group Name          | Members                         ||
|  +---------------------+---------------------------------+|
|  | Newsletter-All      | 150                             ||
|  | VIP-Guests          | 12                              ||
|  +-------------------------------------------------------+|
|                                                           |
+-----------------------------------------------------------+
|                                      [ Cancel ] [ Save ]  |
+-----------------------------------------------------------+
```

### 4.2 TWITTER MODAL
```text
+-----------------------------------------------------------+
| [Twitter Icon] Twitter Configuration                    X |
+-----------------------------------------------------------+
|  [ Settings Icon ] Settings          [ Key Icon ] Credentials |
+-----------------------------------------------------------+
|                                                           |
|  TAB: SETTINGS                                            |
|  -------------------------------------------------------  |
|  TWITTER-ACCOUNTS                                         |
|  +-------------------------------------------------------+|
|  | Account (@username) | Display Name | Status           ||
|  +---------------------+--------------+------------------+|
|  | @EventPromo_DE      | Event Promo  | [Active]         ||
|  +-------------------------------------------------------+|
|  [ + ADD NEW ACCOUNT (Username Input)                  ]  |
|                                                           |
|  HASHTAGS                                                 |
|  +-------------------------------------------------------+|
|  | Hashtag             | Description                     ||
|  +---------------------+---------------------------------+|
|  | #techno             | Techno Events                   ||
|  | #leipzig            | Local Leipzig                   ||
|  +-------------------------------------------------------+|
|  [ + ADD NEW HASHTAG                                   ]  |
|                                                           |
+-----------------------------------------------------------+
|                                      [ Cancel ] [ Save ]  |
+-----------------------------------------------------------+
```

### 4.3 REDDIT MODAL
```text
+-----------------------------------------------------------+
| [Reddit Icon] Reddit Configuration                     X |
+-----------------------------------------------------------+
|  [ Settings Icon ] Settings          [ Key Icon ] Credentials |
+-----------------------------------------------------------+
|                                                           |
|  TAB: SETTINGS                                            |
|  -------------------------------------------------------  |
|  SUBREDDITS                                               |
|  +-------------------------------------------------------+|
|  | Subreddit           | Subscribers | Description       ||
|  +---------------------+-------------+-------------------+|
|  | r/electronicmusic   | 2.5M        | Electronic Music  ||
|  | r/leipzig           | 45k         | Leipzig Local     ||
|  +-------------------------------------------------------+|
|  [ + ADD SUBREDDIT (Name Input)                        ]  |
|                                                           |
|  SUBREDDIT-GRUPPEN                                        |
|  [ Group Name Input... ]  [ Multi-Select Subreddits... ]  |
|  [ BUTTON: CREATE GROUP                                ]  |
|                                                           |
+-----------------------------------------------------------+
|                                      [ Cancel ] [ Save ]  |
+-----------------------------------------------------------+
```

### 4.4 INSTAGRAM MODAL
```text
+-----------------------------------------------------------+
| [Insta Icon] Instagram Configuration                   X |
+-----------------------------------------------------------+
|  [ Settings Icon ] Settings          [ Key Icon ] Credentials |
+-----------------------------------------------------------+
|                                                           |
|  TAB: SETTINGS                                            |
|  -------------------------------------------------------  |
|  INSTAGRAM-ACCOUNTS                                       |
|  +-------------------------------------------------------+|
|  | Account (@user)     | Display Name | Status           ||
|  +---------------------+--------------+------------------+|
|  | @event_insta        | My Event     | [Active]         ||
|  +-------------------------------------------------------+|
|                                                           |
|  LOCATIONS                                                |
|  +-------------------------------------------------------+|
|  | Location Name       | Address                         ||
|  +---------------------+---------------------------------+|
|  | Werk 2              | Kochstraße 132, Leipzig         ||
|  | Distillery          | Kurt-Eisner-Str. 108            ||
|  +-------------------------------------------------------+|
|  [ + ADD LOCATION (Name & ID Input)                    ]  |
|                                                           |
+-----------------------------------------------------------+
|                                      [ Cancel ] [ Save ]  |
+-----------------------------------------------------------+
```

### 4.5 ALLGEMEIN: TAB CREDENTIALS
*(Beispiel Email)*
```text
+-----------------------------------------------------------+
| [Icon] Plattform Konfiguration                          X |
+-----------------------------------------------------------+
|  [ Settings Icon ] Settings          [ Key Icon ] Credentials |
+-----------------------------------------------------------+
|                                                           |
|  TAB: CREDENTIALS                                         |
|  -------------------------------------------------------  |
|  SMTP CONFIGURATION                                       |
|  SMTP Host: [ smtp.gmail.com                           ]  |
|  Port:      [ 587                                      ]  |
|  Username:  [ user@gmail.com                           ]  |
|  Password:  [ ****************                         ]  |
|  From Name: [ My Event Service                         ]  |
|                                                           |
+-----------------------------------------------------------+
|                                      [ Cancel ] [ Save ]  |
+-----------------------------------------------------------+
```

## 5. Integrations-Checkliste
- [ ] Backend: Typen umbenennen (Struktur 1:1 beibehalten)
- [ ] Backend: Validator aktualisieren (nur Key-Rename)
- [ ] Backend: Plattform-Schemas (index.ts) anpassen (**JSDoc erhalten!**)
- [ ] Frontend: HomePage Sidebars entfernen (Full-Width Layout)
- [ ] Frontend: SettingsModal auf Header-Tabs umstellen
- [ ] Frontend: Zahnrad-Icon in Container.jsx integrieren, um Modal zu öffnen
