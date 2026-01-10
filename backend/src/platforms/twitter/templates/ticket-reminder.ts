import { EventTemplate } from './types'

export const ticketReminderTemplate: EventTemplate = {
  id: 'ticket-reminder',
  name: 'Ticket Reminder',
  description: 'A Twitter post template for urgent ticket reminders and last-minute sales',
  category: 'reminder',
  template: '⏰ Last chance! {eventTitle} tomorrow at {venue}\n\n🎫 Limited tickets available\n📅 {date} | Doors: {time}\n\nGet yours now: {link}\n\n#Event #Tickets',
  variables: ['eventTitle', 'venue', 'date', 'time', 'link'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

