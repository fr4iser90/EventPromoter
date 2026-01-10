import { FacebookTemplate } from './types'

export const ticketSalePromotionTemplate: FacebookTemplate = {
  id: 'ticket-sale',
  name: 'Ticket Sale Promotion',
  template: '🎫 TICKETS NOW ON SALE!\n\n🎶 {eventTitle}\n📅 {date} | Doors: {time}\n📍 {venue}, {city}\n\nLimited availability - Don\'t miss out!\n\n{link}\n\n#Tickets #Event',
  category: 'promotion',
  variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'link']
}

