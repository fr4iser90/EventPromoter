import { EmailTemplate } from '../templates';

export const lastMinuteTicketsTemplate: EmailTemplate = {
  id: 'last-minute-tickets',
  name: 'Last Minute Tickets',
  template: {
    subject: '⏰ LAST CHANCE: {eventTitle} - Limited Tickets Available!',
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
      <p>Limited tickets still available for {eventTitle}</p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <h1>{eventTitle}</h1>
      <p style="font-size: 18px; color: #666;">{date} at {venue}</p>
    </div>

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
      <h3>Why attend {eventTitle}?</h3>
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
  category: 'urgent',
  variables: ['eventTitle', 'date', 'venue', 'remainingTickets', 'originalPrice', 'discountedPrice', 'hoursUntilEvent', 'link', 'highlights', 'unsubscribeLink']
};
