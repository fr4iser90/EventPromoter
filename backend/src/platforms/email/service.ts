/**
 * Canonical service entrypoint for the Email platform.
 *
 * Keep platform module imports stable (`./service.js`) while allowing
 * internal service composition in `./services/*`.
 */
export { EmailService } from './services/emailService.js'
