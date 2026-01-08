import { EmailTemplate } from '../templates';

export const eventAnnouncementTemplate: EmailTemplate = {
  id: 'event-announcement',
  name: 'Event Announcement',
  template: {
    subject: '🎉 {eventTitle} - {date} at {venue}',
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
      <h1>🎉 {eventTitle}</h1>
      <p>You're invited to an amazing event!</p>
    </div>

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
  category: 'announcement',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'ticketInfo', 'description', 'highlights', 'link', 'unsubscribeLink', 'website']
};
