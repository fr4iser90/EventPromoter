import { EventTemplate } from './types'

export const ticketReminderTemplate: EventTemplate = {
  id: 'ticket-reminder',
  name: 'Ticket Reminder',
  template: '⏰ Last chance! {eventTitle} tomorrow at {venue}\n\n🎫 Limited tickets available\n📅 {date} | Doors: {time}\n\nGet yours now: {link}\n\n#Event #Tickets',
  category: 'reminder',
  variables: ['eventTitle', 'venue', 'date', 'time', 'link']
}

