import { EmailTemplate } from '../templates';

export const eventReminderTemplate: EmailTemplate = {
  id: 'event-reminder',
  name: 'Event Reminder',
  description: 'An email template for sending event reminders with preparation tips and event details',
  category: 'reminder',
  template: {
    subject: '📅 Reminder: {title} tomorrow at {venue}',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .reminder { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .prep-tips { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="reminder">
      <h2>📅 EVENT REMINDER</h2>
      <p>{title} is tomorrow!</p>
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="details">
      <h3>Your Event Details</h3>
      <p><strong>🎉 Event:</strong> {title}</p>
      <p><strong>📅 Date:</strong> {date}</p>
      <p><strong>🕐 Time:</strong> {time}</p>
      <p><strong>📍 Location:</strong> {venue}, {city}</p>
    </div>

    <div class="prep-tips">
      <h3>🎯 Preparation Tips</h3>
      <ul>
        {prepTips}
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 18px; margin-bottom: 20px;">See you tomorrow! 🎊</p>
      <a href="{link}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Event Details</a>
    </div>

    <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
      <p>Need to make changes? <a href="{contactLink}">Contact us</a></p>
      <p><a href="{unsubscribeLink}">Unsubscribe from reminders</a></p>
    </div>
  </div>
</body>
</html>`
  },
  translations: {
    de: {
      subject: '📅 Erinnerung: {title} morgen in {venue}',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .reminder { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .prep-tips { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="reminder">
      <h2>📅 EVENT ERINNERUNG</h2>
      <p>{title} ist morgen!</p>
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="details">
      <h3>Deine Event Details</h3>
      <p><strong>🎉 Event:</strong> {title}</p>
      <p><strong>📅 Datum:</strong> {date}</p>
      <p><strong>🕐 Uhrzeit:</strong> {time}</p>
      <p><strong>📍 Ort:</strong> {venue}, {city}</p>
    </div>

    <div class="prep-tips">
      <h3>🎯 Vorbereitungstipps</h3>
      <ul>
        {prepTips}
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 18px; margin-bottom: 20px;">Bis morgen! 🎊</p>
      <a href="{link}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Event Details ansehen</a>
    </div>

    <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
      <p>Änderungen nötig? <a href="{contactLink}">Kontaktiere uns</a></p>
      <p><a href="{unsubscribeLink}">Von Erinnerungen abmelden</a></p>
    </div>
  </div>
</body>
</html>`
    },
    es: {
      subject: '📅 Recordatorio: {title} mañana en {venue}',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .reminder { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .prep-tips { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="reminder">
      <h2>📅 RECORDATORIO DE EVENTO</h2>
      <p>¡{title} es mañana!</p>
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="details">
      <h3>Detalles de tu Evento</h3>
      <p><strong>🎉 Evento:</strong> {title}</p>
      <p><strong>📅 Fecha:</strong> {date}</p>
      <p><strong>🕐 Hora:</strong> {time}</p>
      <p><strong>📍 Ubicación:</strong> {venue}, {city}</p>
    </div>

    <div class="prep-tips">
      <h3>🎯 Consejos de Preparación</h3>
      <ul>
        {prepTips}
      </ul>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 18px; margin-bottom: 20px;">¡Nos vemos mañana! 🎊</p>
      <a href="{link}" style="display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Ver Detalles del Evento</a>
    </div>

    <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
      <p>¿Necesitas hacer cambios? <a href="{contactLink}">Contáctanos</a></p>
      <p><a href="{unsubscribeLink}">Cancelar suscripción a recordatorios</a></p>
    </div>
  </div>
</body>
</html>`
    }
  },
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'prepTips', 'link', 'contactLink', 'unsubscribeLink', 'img1'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};
