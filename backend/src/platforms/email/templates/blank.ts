import { EmailTemplate } from '../templates'
import { TEMPLATE_CATEGORIES } from '@/shared/templateCategories.js'

const emptyHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
  </style>
</head>
<body>
  <div class="container">
  </div>
</body>
</html>`

export const blankTemplate: EmailTemplate = {
  id: 'blank',
  name: 'Blank',
  description: 'Empty template to create your own email from scratch. Subject and body are empty.',
  category: TEMPLATE_CATEGORIES.GENERAL,
  template: {
    subject: '',
    html: emptyHtml
  },
  translations: {
    de: {
      name: 'Leer',
      description: 'Leeres Template zum Erstellen einer eigenen E-Mail. Betreff und Inhalt sind leer.',
      subject: '',
      html: emptyHtml
    },
    es: {
      name: 'En blanco',
      description: 'Plantilla vacía para crear tu propio correo. Asunto y cuerpo vacíos.',
      subject: '',
      html: emptyHtml
    }
  },
  variables: [],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}
