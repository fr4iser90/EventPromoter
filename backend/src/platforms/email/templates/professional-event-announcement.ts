import { EmailTemplate } from '../templates';

export const professionalEventAnnouncementTemplate: EmailTemplate = {
  id: 'professional-event-announcement',
  name: 'Professional Event Announcement',
  description: 'A professional email template with header styling for corporate events and networking',
  category: 'announcement',
  template: {
    subject: '📅 {title} - Professional Event Invitation',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 {title}</h1>
    </div>
    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />
    <p>Dear Colleague,</p>
    <p>We are pleased to invite you to join us for an exciting professional event.</p>
    <p><strong>Event Details:</strong></p>
    <ul>
      <li><strong>Date:</strong> {date}</li>
      <li><strong>Time:</strong> {time}</li>
      <li><strong>Location:</strong> {venue}, {city}</li>
    </ul>
    <p>{description}</p>
    <p>We look forward to your participation.</p>
    <p>Best regards,<br>Event Organizers</p>
    <p><a href="{link}">Register Now</a></p>
  </div>
</body>
</html>`
  },
  translations: {
    de: {
      subject: '📅 {title} - Professionelle Event-Einladung',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 {title}</h1>
    </div>
    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />
    <p>Liebe/r Kollege/in,</p>
    <p>Wir freuen uns, Sie zu einem aufregenden professionellen Event einzuladen.</p>
    <p><strong>Event Details:</strong></p>
    <ul>
      <li><strong>Datum:</strong> {date}</li>
      <li><strong>Uhrzeit:</strong> {time}</li>
      <li><strong>Ort:</strong> {venue}, {city}</li>
    </ul>
    <p>{description}</p>
    <p>Wir freuen uns auf Ihre Teilnahme.</p>
    <p>Mit freundlichen Grüßen,<br>Event Organisatoren</p>
    <p><a href="{link}">Jetzt registrieren</a></p>
  </div>
</body>
</html>`
    },
    es: {
      subject: '📅 {title} - Invitación a Evento Profesional',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; }
    .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📅 {title}</h1>
    </div>
    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />
    <p>Estimado/a Colega,</p>
    <p>Nos complace invitarlo a un emocionante evento profesional.</p>
    <p><strong>Detalles del Evento:</strong></p>
    <ul>
      <li><strong>Fecha:</strong> {date}</li>
      <li><strong>Hora:</strong> {time}</li>
      <li><strong>Ubicación:</strong> {venue}, {city}</li>
    </ul>
    <p>{description}</p>
    <p>Esperamos su participación.</p>
    <p>Saludos cordiales,<br>Organizadores del Evento</p>
    <p><a href="{link}">Registrarse Ahora</a></p>
  </div>
</body>
</html>`
    }
  },
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link', 'img1'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

