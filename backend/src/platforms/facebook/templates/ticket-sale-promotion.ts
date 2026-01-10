import { FacebookTemplate } from './types'

export const ticketSalePromotionTemplate: FacebookTemplate = {
  id: 'ticket-sale',
  name: 'Ticket Sale Promotion',
  description: 'A Facebook post template for promoting ticket sales with urgency',
  category: 'promotion',
  template: '🎫 TICKETS NOW ON SALE!\n\n🎶 {eventTitle}\n📅 {date} | Doors: {time}\n📍 {venue}, {city}\n\nLimited availability - Don\'t miss out!\n\n{link}\n\n#Tickets #Event',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'link'],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z'
}

