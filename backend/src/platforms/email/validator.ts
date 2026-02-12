/**
 * Canonical validator entrypoint for the Email platform.
 *
 * Keep platform module imports stable (`./validator.js`) while allowing
 * internal validators in `./validators/*`.
 */
export { EmailValidator } from './validators/emailValidator.js'
