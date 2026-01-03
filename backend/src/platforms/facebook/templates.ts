// Facebook content templates

export interface FacebookTemplate {
  id: string
  name: string
  template: string
  category: string
  variables: string[]
}

export const FACEBOOK_TEMPLATES: FacebookTemplate[] = [
  {
    id: 'basic-event',
    name: 'Basic Event Post',
    template: '🎉 {eventTitle}\n\n📅 {date} at {time}\n📍 {venue}, {city}\n\n{description}\n\nGet your tickets now! 🎫\n\n#Event #Nightlife',
    category: 'announcement',
    variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description']
  },
  {
    id: 'ticket-sale',
    name: 'Ticket Sale Promotion',
    template: '🎫 TICKETS NOW ON SALE!\n\n🎶 {eventTitle}\n📅 {date} | Doors: {time}\n📍 {venue}, {city}\n\nLimited availability - Don\'t miss out!\n\n{link}\n\n#Tickets #Event',
    category: 'promotion',
    variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'link']
  }
]

export function getTemplatesByCategory(category: string): FacebookTemplate[] {
  return FACEBOOK_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): FacebookTemplate | undefined {
  return FACEBOOK_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(template: FacebookTemplate, variables: Record<string, string>): string {
  let result = template.template

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }

  return result
}
