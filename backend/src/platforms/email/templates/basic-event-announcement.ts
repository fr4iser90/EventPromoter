import { EmailTemplate } from '../templates';

export const basicEventAnnouncementTemplate: EmailTemplate = {
  id: 'basic-event-announcement',
  name: 'Basic Event Announcement',
  description: 'A simple and clean email template for announcing events with basic event details',
  category: 'announcement',
  template: {
    subject: '🎉 {title} - {date}',
    html: `<!DOCTYPE html>
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
    <h1>🎉 {title}</h1>
    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />
    <p><strong>📅 Date:</strong> {date}</p>
    <p><strong>🕐 Time:</strong> {time}</p>
    <p><strong>📍 Location:</strong> {venue}, {city}</p>
    <p>{description}</p>
    <p><a href="{link}">Get Tickets</a></p>
  </div>
</body>
</html>`
  },
  translations: {
    de: {
      subject: '🎉 {title} - {date}',
      html: `<!DOCTYPE html>
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
    <h1>🎉 {title}</h1>
    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />
    <p><strong>📅 Datum:</strong> {date}</p>
    <p><strong>🕐 Uhrzeit:</strong> {time}</p>
    <p><strong>📍 Ort:</strong> {venue}, {city}</p>
    <p>{description}</p>
    <p><a href="{link}">Tickets sichern</a></p>
  </div>
</body>
</html>`
    },
    es: {
      subject: '🎉 {title} - {date}',
      html: `<!DOCTYPE html>
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
    <h1>🎉 {title}</h1>
    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />
    <p><strong>📅 Fecha:</strong> {date}</p>
    <p><strong>🕐 Hora:</strong> {time}</p>
    <p><strong>📍 Ubicación:</strong> {venue}, {city}</p>
    <p>{description}</p>
    <p><a href="{link}">Obtener Entradas</a></p>
  </div>
</body>
</html>`
    }
  },
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link', 'img1'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

