import { Router } from 'express';
import { getInstagramTranslations } from '../platforms/instagram/translations.js';
import { getLinkedInTranslations } from '../platforms/linkedin/translations.js';
import { getTwitterTranslations } from '../platforms/twitter/translations.js';
import { getEmailTranslations } from '../platforms/email/translations.js';

const router = Router();

// Instagram translations
router.get('/instagram/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    const translations = getInstagramTranslations(lang);
    res.json(translations);
  } catch (error) {
    console.error('Error loading Instagram translations:', error);
    res.status(500).json({ error: 'Failed to load translations' });
  }
});

// LinkedIn translations
router.get('/linkedin/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    const translations = getLinkedInTranslations(lang);
    res.json(translations);
  } catch (error) {
    console.error('Error loading LinkedIn translations:', error);
    res.status(500).json({ error: 'Failed to load translations' });
  }
});

// Twitter translations
router.get('/twitter/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    const translations = getTwitterTranslations(lang);
    res.json(translations);
  } catch (error) {
    console.error('Error loading Twitter translations:', error);
    res.status(500).json({ error: 'Failed to load translations' });
  }
});

// Email translations
router.get('/email/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    const translations = getEmailTranslations(lang);
    res.json(translations);
  } catch (error) {
    console.error('Error loading Email translations:', error);
    res.status(500).json({ error: 'Failed to load translations' });
  }
});

export default router;
