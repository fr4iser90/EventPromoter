import { EmailTemplate } from '../templates';

export const professionalEventAnnouncementTemplate: EmailTemplate = {
  id: 'professional-event-announcement',
  name: 'Professional Event Announcement',
  description: 'A professional email template with header styling for corporate events and networking',
  category: 'announcement',
  template: {
    subject: '📅 {eventTitle} - Professional Event Invitation',
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
      <h1>📅 {eventTitle}</h1>
    </div>
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
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description', 'link'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
};

