# Secrets Encryption

## Übersicht

Alle sensiblen Credentials (Passwords, API Keys, Tokens) werden **verschlüsselt** gespeichert, nicht im Klartext.

## Verschlüsselungsmethode

- **Algorithmus**: AES-256-GCM (Authenticated Encryption)
- **Key Derivation**: PBKDF2 mit 100.000 Iterationen
- **Authentifizierung**: GCM verhindert Manipulation der verschlüsselten Daten

## Encryption Key Management

### Automatische Key-Generierung ✅

**Die App generiert automatisch einen Encryption Key**, wenn keiner gesetzt ist!

**Priorität:**
1. **`SECRETS_ENCRYPTION_KEY` Environment Variable** (höchste Priorität, empfohlen für Production)
2. **`.secrets-key` Datei** (automatisch generiert, persistent)
3. **Neue Generierung** (beim ersten Start)

### Option 1: Automatisch (Empfohlen für Entwicklung)

**Nichts tun!** Die App generiert beim ersten Start automatisch einen Key und speichert ihn in `config/.secrets-key`.

- ✅ Einfach: Keine manuelle Konfiguration nötig
- ✅ Sicher: Zufälliger 256-bit Key
- ✅ Persistent: Key wird gespeichert und wiederverwendet
- ⚠️ Wichtig: `.secrets-key` Datei muss gesichert werden (für Datenwiederherstellung)

### Option 2: Environment Variable (Empfohlen für Production)

```bash
# Option A: 64-Zeichen Hex-String (64 hex chars = 32 bytes)
SECRETS_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef

# Option B: Beliebiger String (wird mit PBKDF2 zu einem Key abgeleitet)
SECRETS_ENCRYPTION_KEY=mein-super-geheimer-schluessel-fuer-production
```

### Key generieren (für manuelle Konfiguration)

```bash
# Mit OpenSSL (64 hex chars = 32 bytes für AES-256)
openssl rand -hex 32

# Oder mit Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Entwicklung vs. Production

### Entwicklung
- ✅ **Automatisch**: Key wird beim ersten Start generiert und in `.secrets-key` gespeichert
- ✅ **Sicher**: Zufälliger 256-bit Key (nicht unsicherer Default!)
- ✅ **Persistent**: Key wird wiederverwendet bei jedem Start

### Production
- **Option A (Empfohlen)**: `SECRETS_ENCRYPTION_KEY` Environment Variable setzen
- **Option B**: `.secrets-key` Datei sicher speichern und deployen
- ⚠️ **Wichtig**: Key muss gesichert werden! Bei Verlust können verschlüsselte Daten nicht mehr entschlüsselt werden
- Key sollte sicher verwaltet werden (z.B. Docker Secrets, Kubernetes Secrets, Vault)

## Wie es funktioniert

### Beim Speichern:
1. User gibt Credentials ein (z.B. `password123`)
2. Backend validiert die Eingabe
3. **Verschlüsselung**: `password123` → `base64(encrypted_data)`
4. Verschlüsselte Daten werden in `config/platform-{platformId}-settings.json` gespeichert

### Beim Laden:
1. Backend lädt verschlüsselte Daten aus Config-Datei
2. **Entschlüsselung**: `base64(encrypted_data)` → `password123`
3. **Maskierung**: `password123` → `pass****123` (für Frontend)
4. Frontend erhält nur maskierte Werte

### Beispiel

**Gespeichert in Config-Datei:**
```json
{
  "apiKey": "abcd1234",
  "apiSecret": "U2FsdGVkX1+ivy5iBxQ==",  // ← Verschlüsselt!
  "password": "U2FsdGVkX1+xyz789=="       // ← Verschlüsselt!
}
```

**An Frontend gesendet:**
```json
{
  "apiKey": "abcd****1234",  // ← Maskiert
  "apiSecret": "U2Fs****==",  // ← Maskiert (verschlüsselt bleibt verschlüsselt)
  "password": "U2Fs****=="    // ← Maskiert
}
```

## Sicherheits-Features

✅ **Verschlüsselung**: Alle Secrets werden mit AES-256-GCM verschlüsselt  
✅ **Authentifizierung**: GCM verhindert Manipulation  
✅ **Maskierung**: Frontend sieht nie echte Werte  
✅ **Key Derivation**: PBKDF2 mit 100.000 Iterationen  
✅ **Unique IVs**: Jede Verschlüsselung verwendet einen zufälligen IV  

## Migration bestehender Daten

Bestehende unverschlüsselte Credentials werden automatisch verschlüsselt, wenn:
- Settings gespeichert werden
- Der Wert nicht maskiert ist (also wirklich geändert wurde)

## Troubleshooting

### "SECRETS_ENCRYPTION_KEY environment variable is required"
- Setze die Environment-Variable in Production
- Oder verwende einen Secrets-Manager

### "Failed to decrypt value"
- Möglicherweise wurde der Encryption Key geändert
- Alte verschlüsselte Daten können nicht mehr entschlüsselt werden
- Lösung: Settings neu eingeben und speichern
