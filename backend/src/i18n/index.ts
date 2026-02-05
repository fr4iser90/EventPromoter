import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import * as middleware from 'i18next-http-middleware'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const localesPath = path.join(__dirname, './locales/{{lng}}.json')

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    preload: ['en', 'de', 'es'],
    ns: ['common', 'errors', 'validation'],
    defaultNS: 'common',
    backend: {
      loadPath: localesPath
    },
    detection: {
      order: ['header', 'querystring', 'cookie'],
      caches: false
    },
    interpolation: {
      escapeValue: false
    }
  })

export default i18next
export const i18nMiddleware = middleware.handle(i18next)
