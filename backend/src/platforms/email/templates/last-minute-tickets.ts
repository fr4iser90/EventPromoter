import { EmailTemplate } from '../templates';

export const lastMinuteTicketsTemplate: EmailTemplate = {
  id: 'last-minute-tickets',
  name: 'Last Minute Tickets',
  description: 'An urgent email template for last-minute ticket sales with countdown and special pricing',
  category: 'urgent',
  template: {
    subject: '⏰ LAST CHANCE: {title} - Limited Tickets Available!',
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .urgent { background: #ff6b6b; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .price { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); }
    .timer { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="urgent">
      <h2>🚨 LAST MINUTE OPPORTUNITY!</h2>
      <p>Limited tickets still available for {title}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <h1>{title}</h1>
      <p style="font-size: 18px; color: #666;">{date} at {venue}</p>
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="price">
      🎫 Only {remainingTickets} tickets left!<br>
      <span style="font-size: 16px;">Regular price: {originalPrice}</span><br>
      <span style="color: #dc3545; text-decoration: line-through;">{originalPrice}</span>
      → <strong>{discountedPrice}</strong>
    </div>

    <div class="timer">
      <h3>⏰ Time is running out!</h3>
      <p>Event starts in just {hoursUntilEvent} hours. Don't miss out!</p>
    </div>

    <div style="text-align: center;">
      <a href="{link}" class="cta-button">GRAB YOUR TICKETS NOW!</a>
    </div>

    <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h3>Why attend {title}?</h3>
      <ul>
        {highlights}
      </ul>
    </div>

    <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
      <p>This is a time-sensitive offer. Prices subject to change.</p>
      <p><a href="{unsubscribeLink}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`
  },
  translations: {
    de: {
      subject: '⏰ LETZTE CHANCE: {title} - Begrenzte Tickets verfügbar!',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .urgent { background: #ff6b6b; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .price { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); }
    .timer { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="urgent">
      <h2>🚨 LAST MINUTE GELEGENHEIT!</h2>
      <p>Begrenzte Tickets noch verfügbar für {title}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <h1>{title}</h1>
      <p style="font-size: 18px; color: #666;">{date} in {venue}</p>
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="price">
      🎫 Nur noch {remainingTickets} Tickets!<br>
      <span style="font-size: 16px;">Regulärer Preis: {originalPrice}</span><br>
      <span style="color: #dc3545; text-decoration: line-through;">{originalPrice}</span>
      → <strong>{discountedPrice}</strong>
    </div>

    <div class="timer">
      <h3>⏰ Die Zeit läuft ab!</h3>
      <p>Das Event beginnt in nur {hoursUntilEvent} Stunden. Verpasse es nicht!</p>
    </div>

    <div style="text-align: center;">
      <a href="{link}" class="cta-button">JETZT TICKETS SICHERN!</a>
    </div>

    <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h3>Warum {title} besuchen?</h3>
      <ul>
        {highlights}
      </ul>
    </div>

    <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
      <p>Dies ist ein zeitlich begrenztes Angebot. Preise können sich ändern.</p>
      <p><a href="{unsubscribeLink}">Abmelden</a></p>
    </div>
  </div>
</body>
</html>`
    },
    es: {
      subject: '⏰ ÚLTIMA OPORTUNIDAD: {title} - ¡Entradas Limitadas Disponibles!',
      html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
    .urgent { background: #ff6b6b; color: white; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .price { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
    .cta-button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3); }
    .timer { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="urgent">
      <h2>🚨 ¡OPORTUNIDAD DE ÚLTIMO MINUTO!</h2>
      <p>Entradas limitadas aún disponibles para {title}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <h1>{title}</h1>
      <p style="font-size: 18px; color: #666;">{date} en {venue}</p>
    </div>

    <img src="{img1}" alt="Event Image" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; display: block;" />

    <div class="price">
      🎫 ¡Solo quedan {remainingTickets} entradas!<br>
      <span style="font-size: 16px;">Precio regular: {originalPrice}</span><br>
      <span style="color: #dc3545; text-decoration: line-through;">{originalPrice}</span>
      → <strong>{discountedPrice}</strong>
    </div>

    <div class="timer">
      <h3>⏰ ¡Se acaba el tiempo!</h3>
      <p>El evento comienza en solo {hoursUntilEvent} horas. ¡No te lo pierdas!</p>
    </div>

    <div style="text-align: center;">
      <a href="{link}" class="cta-button">¡OBTÉN TUS ENTRADAS AHORA!</a>
    </div>

    <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px;">
      <h3>¿Por qué asistir a {title}?</h3>
      <ul>
        {highlights}
      </ul>
    </div>

    <div style="text-align: center; font-size: 12px; color: #666; margin-top: 30px;">
      <p>Esta es una oferta limitada en el tiempo. Los precios pueden cambiar.</p>
      <p><a href="{unsubscribeLink}">Cancelar suscripción</a></p>
    </div>
  </div>
</body>
</html>`
    }
  },
  variables: ['eventTitle', 'date', 'venue', 'remainingTickets', 'originalPrice', 'discountedPrice', 'hoursUntilEvent', 'link', 'highlights', 'unsubscribeLink', 'img1'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};
