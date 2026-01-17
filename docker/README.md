# 🐳 Docker Setup für EventPromoter

## ⚠️ WICHTIG: Nicht Production Ready

**Dieses Setup ist noch NICHT production-ready!** Siehe [PRODUCTION-TODO.md](./PRODUCTION-TODO.md) für alle offenen Punkte.

**Kritische Probleme**:
- Backend startet nicht wegen jsdom ES-Modul-Konflikt
- Alle Dependencies werden installiert (auch dev) - nicht optimal für Production

## Übersicht

Das Docker-Setup verwendet **Multi-Stage Builds** für Production:
- **Backend**: TypeScript wird in Docker gebaut → Node.js Runtime
- **Frontend**: Vite build in Docker → nginx serviert die statischen Dateien

## 🚀 Verwendung

### Build & Start

```bash
# Alles bauen und starten
docker-compose up --build

# Im Hintergrund
docker-compose up -d --build

# Nur starten (ohne rebuild)
docker-compose up -d
```

### Stoppen

```bash
docker-compose down
```

### Logs ansehen

```bash
docker-compose logs -f
# Oder für einzelne Services:
docker-compose logs -f backend
docker-compose logs -f frontend
```

## 📁 Struktur

- **Backend**: Port 4000
- **Frontend**: Port 3000 (nginx auf Port 80 im Container)
- **Config**: Gemountet als Volume von `./config` → `/app/config`

## 🔧 Wie funktioniert's?

### Build-Prozess

1. **Backend Build**:
   - Stage 1: Installiert Dependencies, baut TypeScript → `backend/dist`
   - Stage 2: Nur Production Dependencies, kopiert `dist` und startet Node

2. **Frontend Build**:
   - Stage 1: Installiert Dependencies, baut mit Vite → `frontend/dist`
   - Stage 2: Kopiert `dist` nach nginx, konfiguriert nginx

### Warum Multi-Stage?

- **Kleinere Images**: Nur Production-Dependencies im finalen Image
- **Sicherheit**: Keine Build-Tools im Production-Container
- **Performance**: Build-Cache wird optimal genutzt

## 🔄 Development vs Production

**Aktuelles Setup**: Production-Builds (Code wird in Docker gebaut)

Für Development mit Hot-Reload könntest du später:
- Volume-Mounts für Source-Code hinzufügen
- Separate `docker-compose.dev.yml` erstellen

## 📝 Environment Variables

Backend erwartet:
- `PORT` (default: 4000)
- `NODE_ENV` (default: production)

Erstelle eine `.env` Datei im Root für weitere Variablen.
