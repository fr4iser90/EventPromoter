// Email content templates

export interface EmailTemplate {
  id: string
  name: string
  template: {
    subject: string
    html: string
  }
  category: string
  variables: string[]
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
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
  },
  {
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
  },
  {
    id: 'event-reminder',
    name: 'Event Reminder',
    template: {
      subject: '📅 Reminder: {eventTitle} tomorrow at {venue}',
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
      <p>{eventTitle} is tomorrow!</p>
    </div>

    <div class="details">
      <h3>Your Event Details</h3>
      <p><strong>🎉 Event:</strong> {eventTitle}</p>
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
    category: 'reminder',
    variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'prepTips', 'link', 'contactLink', 'unsubscribeLink']
  }
]

export function getTemplatesByCategory(category: string): EmailTemplate[] {
  return EMAIL_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): EmailTemplate | undefined {
  return EMAIL_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(template: EmailTemplate, variables: Record<string, string>): { subject: string, html: string } {
  let subject = template.template.subject
  let html = template.template.html

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g')
    subject = subject.replace(regex, value)
    html = html.replace(regex, value)
  }

  return { subject, html }
}

export function createUnsubscribeLink(userId: string, emailId: string): string {
  return `https://yourapp.com/unsubscribe?user=${userId}&email=${emailId}`
}

export function createEventLink(eventId: string): string {
  return `https://yourapp.com/events/${eventId}`
}
