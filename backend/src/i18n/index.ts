// Filter i18next locize.com spam messages
const filterI18nextSpam = (args: any[]): boolean => {
  return args.some(arg => 
    typeof arg === 'string' && arg.includes('i18next is maintained')
  );
};

const originalLog = console.log;
const originalInfo = console.info;
const originalWarn = console.warn;
const originalError = console.error;

console.log = (...args: any[]) => {
  if (filterI18nextSpam(args)) return;
  originalLog(...args);
};

console.info = (...args: any[]) => {
  if (filterI18nextSpam(args)) return;
  originalInfo(...args);
};

console.warn = (...args: any[]) => {
  if (filterI18nextSpam(args)) return;
  originalWarn(...args);
};

console.error = (...args: any[]) => {
  if (filterI18nextSpam(args)) return;
  originalError(...args);
};

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
    },
    debug: false
  })

export default i18next
export const i18nMiddleware = middleware.handle(i18next)
