import { Router } from 'express';
import { getPlatformTranslations, getAllPlatformTranslations } from '../utils/translationLoader.js';

const router = Router();

// Unified platform translations endpoint
// GET /api/translations/:platformId/:lang
router.get('/:platformId/:lang', async (req, res) => {
  try {
    const { platformId, lang } = req.params;
    
    // Validate language
    const validLangs = ['en', 'de', 'es'];
    if (!validLangs.includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language',
        supportedLanguages: validLangs
      });
    }

    const translations = await getPlatformTranslations(platformId, lang);
    res.json({
      success: true,
      platform: platformId,
      language: lang,
      translations
    });
  } catch (error: any) {
    console.error(`Error loading translations for ${req.params.platformId}:`, error);
    res.status(500).json({
      error: 'Failed to load translations',
      details: error.message
    });
  }
});

// Get all platform translations for a language
// GET /api/translations/:lang
router.get('/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    
    // Validate language
    const validLangs = ['en', 'de', 'es'];
    if (!validLangs.includes(lang)) {
      return res.status(400).json({
        error: 'Invalid language',
        supportedLanguages: validLangs
      });
    }

    const translations = await getAllPlatformTranslations(lang);
    res.json({
      success: true,
      language: lang,
      translations
    });
  } catch (error: any) {
    console.error(`Error loading all translations for ${req.params.lang}:`, error);
    res.status(500).json({
      error: 'Failed to load translations',
      details: error.message
    });
  }
});

// ❌ REMOVED: Legacy hardcoded platform endpoints
// Use generic /:platformId/:lang endpoint instead

export default router;
