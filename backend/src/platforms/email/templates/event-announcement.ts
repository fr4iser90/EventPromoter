import { EmailTemplate } from '../templates';
import { TEMPLATE_CATEGORIES } from '@/shared/templateCategories.js';

export const eventAnnouncementTemplate: EmailTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  description: 'A comprehensive email template for event announcements with detailed information and call-to-action',
  category: TEMPLATE_CATEGORIES.ANNOUNCEMENT,
  template: {
    subject: '🎉 {title} - {date} at {venue}',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 {title}</h1>
      <p>You're invited to an amazing event!</p>
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="event-details">
      <h2>Event Details</h2>
      <p><strong>📅 Date:</strong> {date}</p>
      <p><strong>🕐 Time:</strong> {time}</p>
      <p><strong>📍 Location:</strong> {venue}, {city}</p>
      <p><strong>💰 Tickets:</strong> {ticketInfo}</p>
    </div>

    <div style="margin: 30px 0;">
      <h3>About the Event</h3>
      <p>{description}</p>

      <h4>What to expect:</h4>
      <ul>
        {highlights}
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="{link}" class="cta-button">Get Your Tickets Now!</a>
    </div>

    <div class="footer">
      <p>You received this email because you're subscribed to our event notifications.</p>
      <p><a href="{unsubscribeLink}">Unsubscribe</a> | <a href="{website}">Visit our website</a></p>
    </div>
  </div>
</body>
</html>`
  },
  translations: {
    de: {
      name: 'Event-Ankündigung',
      description: 'Eine umfassende E-Mail-Vorlage für Event-Ankündigungen mit detaillierten Informationen und Call-to-Action',
      subject: '🎉 {title} - {date} in {venue}',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 {title}</h1>
      <p>Du bist zu einem großartigen Event eingeladen!</p>
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="event-details">
      <h2>Event Details</h2>
      <p><strong>📅 Datum:</strong> {date}</p>
      <p><strong>🕐 Uhrzeit:</strong> {time}</p>
      <p><strong>📍 Ort:</strong> {venue}, {city}</p>
      <p><strong>💰 Tickets:</strong> {ticketInfo}</p>
    </div>

    <div style="margin: 30px 0;">
      <h3>Über das Event</h3>
      <p>{description}</p>

      <h4>Was dich erwartet:</h4>
      <ul>
        {highlights}
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="{link}" class="cta-button">Jetzt Tickets sichern!</a>
    </div>

    <div class="footer">
      <p>Du hast diese E-Mail erhalten, weil du für Event-Benachrichtigungen angemeldet bist.</p>
      <p><a href="{unsubscribeLink}">Abmelden</a> | <a href="{website}">Unsere Website besuchen</a></p>
    </div>
  </div>
</body>
</html>`
    },
    es: {
      name: 'Anuncio de Evento',
      description: 'Una plantilla de correo electrónico completa para anuncios de eventos con información detallada y llamada a la acción',
      subject: '🎉 {title} - {date} en {venue}',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .header { text-align: center; margin-bottom: 30px; }
    .event-details { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 {title}</h1>
      <p>¡Estás invitado a un evento increíble!</p>
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="event-details">
      <h2>Detalles del Evento</h2>
      <p><strong>📅 Fecha:</strong> {date}</p>
      <p><strong>🕐 Hora:</strong> {time}</p>
      <p><strong>📍 Ubicación:</strong> {venue}, {city}</p>
      <p><strong>💰 Entradas:</strong> {ticketInfo}</p>
    </div>

    <div style="margin: 30px 0;">
      <h3>Acerca del Evento</h3>
      <p>{description}</p>

      <h4>Qué esperar:</h4>
      <ul>
        {highlights}
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="{link}" class="cta-button">¡Obtén tus Entradas Ahora!</a>
    </div>

    <div class="footer">
      <p>Recibiste este correo porque estás suscrito a nuestras notificaciones de eventos.</p>
      <p><a href="{unsubscribeLink}">Cancelar suscripción</a> | <a href="{website}">Visitar nuestro sitio web</a></p>
    </div>
  </div>
</body>
</html>`
    }
  },
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'ticketInfo', 'description', 'highlights', 'link', 'unsubscribeLink', 'website', 'img1'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};
