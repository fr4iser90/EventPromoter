import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const translations: Record<string, any> = {};

const loadTranslations = () => {
  const localesDir = path.join(__dirname, 'locales');

  ['en', 'de', 'es'].forEach(lang => {
    const filePath = path.join(localesDir, `${lang}.json`);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      translations[lang] = JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load ${lang} translations for Email:`, error);
    }
  });
};

loadTranslations();

export function getEmailTranslations(lang: string) {
  return translations[lang] || translations.en;
}

// Reload translations (useful for development)
export function reloadEmailTranslations() {
  loadTranslations();
}
