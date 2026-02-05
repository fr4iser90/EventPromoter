import { EmailTemplate } from '../templates';
import { TEMPLATE_CATEGORIES } from '@/shared/templateCategories.js';

export const personalInvitationTemplate: EmailTemplate = {
  id: 'personal-invitation',
  name: 'Personal Invitation',
  description: 'A personal and friendly email template for inviting people to events using name tags',
  category: TEMPLATE_CATEGORIES.INVITATION,
  template: {
    subject: '🎉 You\'re invited: {name}',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; line-height: 1.6; }
    .event-name { font-size: 28px; font-weight: bold; color: #667eea; margin: 20px 0; text-align: center; }
    .personal-message { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .event-details { background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
    .detail-item { margin: 12px 0; font-size: 16px; }
    .detail-item strong { color: #667eea; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="greeting">
      <p>Hello! 👋</p>
      <p>I'd like to invite you to <strong>{name}</strong>!</p>
    </div>

    <div class="event-name">
      {name}
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="personal-message">
      <p style="margin: 0; font-size: 16px; line-height: 1.6;">
        {description}
      </p>
    </div>

    <div class="event-details">
      <h3 style="margin-top: 0; color: #333;">📋 Event Details</h3>
      <div class="detail-item">
        <strong>📅 Date:</strong> {date}
      </div>
      <div class="detail-item">
        <strong>🕐 Time:</strong> {time}
      </div>
      <div class="detail-item">
        <strong>📍 Venue:</strong> {venue}
      </div>
      <div class="detail-item">
        <strong>🏙️ City:</strong> {city}
      </div>
      <div class="detail-item">
        <strong>💰 Price:</strong> {price}
      </div>
      <div class="detail-item">
        <strong>🎤 Lineup:</strong> {lineup}
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 18px; margin-bottom: 20px;">I'm looking forward to seeing you there! 🎊</p>
      <a href="{link}" class="cta-button">Get Tickets Now</a>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p>More Info: <a href="{website}" style="color: #667eea; text-decoration: none;">{website}</a></p>
    </div>

    <div class="footer">
      <p>If you have any questions, just let me know!</p>
      <p>Organized by: {organizer}</p>
    </div>
  </div>
</body>
</html>`
  },
  translations: {
    de: {
      name: 'Persönliche Einladung',
      description: 'Eine persönliche und freundliche E-Mail-Vorlage zum Einladen von Personen zu Events mit Namens-Tags',
      subject: '🎉 Du bist eingeladen: {name}',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; line-height: 1.6; }
    .event-name { font-size: 28px; font-weight: bold; color: #667eea; margin: 20px 0; text-align: center; }
    .personal-message { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .event-details { background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
    .detail-item { margin: 12px 0; font-size: 16px; }
    .detail-item strong { color: #667eea; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="greeting">
      <p>Hallo! 👋</p>
      <p>Ich möchte dich herzlich zu <strong>{name}</strong> einladen!</p>
    </div>

    <div class="event-name">
      {name}
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="personal-message">
      <p style="margin: 0; font-size: 16px; line-height: 1.6;">
        {description}
      </p>
    </div>

    <div class="event-details">
      <h3 style="margin-top: 0; color: #333;">📋 Event Details</h3>
      <div class="detail-item">
        <strong>📅 Datum:</strong> {date}
      </div>
      <div class="detail-item">
        <strong>🕐 Uhrzeit:</strong> {time}
      </div>
      <div class="detail-item">
        <strong>📍 Ort:</strong> {venue}
      </div>
      <div class="detail-item">
        <strong>🏙️ Stadt:</strong> {city}
      </div>
      <div class="detail-item">
        <strong>💰 Preis:</strong> {price}
      </div>
      <div class="detail-item">
        <strong>🎤 Lineup:</strong> {lineup}
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 18px; margin-bottom: 20px;">Ich würde mich freuen, dich dort zu sehen! 🎊</p>
      <a href="{link}" class="cta-button">Jetzt Tickets sichern</a>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p>Mehr Infos: <a href="{website}" style="color: #667eea; text-decoration: none;">{website}</a></p>
    </div>

    <div class="footer">
      <p>Falls du Fragen hast, melde dich einfach bei mir!</p>
      <p>Organisiert von: {organizer}</p>
    </div>
  </div>
</body>
</html>`
    },
    es: {
      name: 'Invitación Personal',
      description: 'Una plantilla de correo electrónico personal y amigable para invitar personas a eventos usando etiquetas de nombre',
      subject: '🎉 Estás invitado: {name}',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .greeting { font-size: 18px; color: #333; margin-bottom: 20px; line-height: 1.6; }
    .event-name { font-size: 28px; font-weight: bold; color: #667eea; margin: 20px 0; text-align: center; }
    .personal-message { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
    .event-details { background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0e0e0; }
    .detail-item { margin: 12px 0; font-size: 16px; }
    .detail-item strong { color: #667eea; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="greeting">
      <p>¡Hola! 👋</p>
      <p>¡Me gustaría invitarte a <strong>{name}</strong>!</p>
    </div>

    <div class="event-name">
      {name}
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="personal-message">
      <p style="margin: 0; font-size: 16px; line-height: 1.6;">
        {description}
      </p>
    </div>

    <div class="event-details">
      <h3 style="margin-top: 0; color: #333;">📋 Detalles del Evento</h3>
      <div class="detail-item">
        <strong>📅 Fecha:</strong> {date}
      </div>
      <div class="detail-item">
        <strong>🕐 Hora:</strong> {time}
      </div>
      <div class="detail-item">
        <strong>📍 Lugar:</strong> {venue}
      </div>
      <div class="detail-item">
        <strong>🏙️ Ciudad:</strong> {city}
      </div>
      <div class="detail-item">
        <strong>💰 Precio:</strong> {price}
      </div>
      <div class="detail-item">
        <strong>🎤 Lineup:</strong> {lineup}
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <p style="font-size: 18px; margin-bottom: 20px;">¡Espero verte allí! 🎊</p>
      <a href="{link}" class="cta-button">Obtener Entradas Ahora</a>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p>Más Información: <a href="{website}" style="color: #667eea; text-decoration: none;">{website}</a></p>
    </div>

    <div class="footer">
      <p>Si tienes alguna pregunta, ¡avísame!</p>
      <p>Organizado por: {organizer}</p>
    </div>
  </div>
</body>
</html>`
    }
  },
  variables: ['name', 'title', 'eventTitle', 'date', 'time', 'venue', 'city', 'description', 'price', 'lineup', 'link', 'website', 'organizer', 'img1'],
  requiredTargetFields: ['name'], // Requires name (firstName+lastName or name field) on targets
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
