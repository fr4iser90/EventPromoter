# Traefik Security Headers Konfiguration

## Übersicht

Bei Verwendung von Traefik als Reverse Proxy sollten Security Headers idealerweise **im Traefik** gesetzt werden, nicht nur im Backend. Das hat folgende Vorteile:

1. **Einheitliche Konfiguration**: Alle Requests (Frontend + Backend) bekommen die Headers
2. **HSTS korrekt setzen**: HSTS sollte nur bei HTTPS gesetzt werden - Traefik weiß, ob HTTPS verwendet wird
3. **Zentrale Verwaltung**: Alle Security Headers an einem Ort

## Option 1: Middleware über Labels (Empfohlen für Docker Compose)

Die einfachste Methode ist, die Security Headers direkt in `docker-compose.traefik.yml` über Labels zu setzen:

```yaml
services:
  frontend:
    labels:
      # Security Headers Middleware definieren
      - "traefik.http.middlewares.security-headers.headers.stsSeconds=31536000"
      - "traefik.http.middlewares.security-headers.headers.stsIncludeSubdomains=true"
      - "traefik.http.middlewares.security-headers.headers.stsPreload=true"
      - "traefik.http.middlewares.security-headers.headers.frameDeny=true"
      - "traefik.http.middlewares.security-headers.headers.contentTypeNosniff=true"
      - "traefik.http.middlewares.security-headers.headers.browserXssFilter=true"
      - "traefik.http.middlewares.security-headers.headers.referrerPolicy=strict-origin-when-cross-origin"
      
      # Middleware auf Router anwenden
      - "traefik.http.routers.eventpromoter-frontend.middlewares=default@file,alexAuth@file,security-headers"
      
  backend:
    labels:
      # Gleiche Middleware für Backend
      - "traefik.http.routers.eventpromoter-backend.middlewares=default@file,alexAuth@file,security-headers"
```

## Option 2: Middleware über Datei (Für komplexere Setups)

1. Kopiere `docker/traefik-security-headers.yml` in dein Traefik-Config-Verzeichnis (z.B. `/etc/traefik/dynamic/`)

2. Referenziere die Datei in deiner Traefik-Hauptkonfiguration (`traefik.yml`):

```yaml
providers:
  file:
    filename: /etc/traefik/dynamic/traefik-security-headers.yml
    watch: true
```

3. Verwende die Middleware in `docker-compose.traefik.yml`:

```yaml
services:
  frontend:
    labels:
      - "traefik.http.routers.eventpromoter-frontend.middlewares=default@file,alexAuth@file,security-headers@file"
```

## Wichtige Hinweise

### HSTS (Strict-Transport-Security)

- **Nur bei HTTPS setzen!** Traefik setzt HSTS automatisch nur bei HTTPS-Requests
- `stsPreload: true` ermöglicht die Aufnahme in die HSTS Preload List
- Vor der Aktivierung von `stsPreload` sollte die Domain auf [hstspreload.org](https://hstspreload.org) geprüft werden

### Content-Security-Policy (CSP)

- CSP wird normalerweise vom Backend (Helmet) gesetzt, da es app-spezifisch ist
- Wenn CSP auch in Traefik gesetzt wird, muss darauf geachtet werden, dass beide nicht kollidieren
- Empfehlung: CSP nur im Backend setzen

### Reihenfolge der Middlewares

Die Reihenfolge ist wichtig! Security Headers sollten **nach** anderen Middlewares (wie Auth) angewendet werden:

```yaml
middlewares=default@file,alexAuth@file,security-headers
```

## Testing

Nach der Konfiguration kannst du die Security Headers testen:

```bash
# Mit curl
curl -I https://eventpromoter.fr4iser.com

# Oder mit dem HTTPS Checker Tool
# https://https-checker.sh/
```

## Weitere Ressourcen

- [Traefik Headers Middleware Dokumentation](https://doc.traefik.io/traefik/middlewares/http/headers/)
- [Mozilla Security Headers Guide](https://infosec.mozilla.org/guidelines/web_security)
- [HSTS Preload List](https://hstspreload.org/)
