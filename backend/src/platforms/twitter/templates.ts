// Twitter content templates

export interface EventTemplate {
  id: string
  name: string
  template: string
  category: string
  variables: string[]
}

export const TWITTER_TEMPLATES: EventTemplate[] = [
  {
    id: 'basic-event',
    name: 'Basic Event Announcement',
    template: '🎉 {eventTitle}\n📅 {date} at {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Nightlife',
    category: 'announcement',
    variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description']
  },
  {
    id: 'dj-event',
    name: 'DJ Event Promotion',
    template: '🎧 DJ {djName} live at {venue}!\n\n🎶 {eventTitle}\n📅 {date} | {time}\n📍 {venue}, {city}\n\n{description}\n\n🎵 #DJ #Techno #Nightlife',
    category: 'music',
    variables: ['djName', 'eventTitle', 'date', 'time', 'venue', 'city', 'description']
  },
  {
    id: 'ticket-reminder',
    name: 'Ticket Reminder',
    template: '⏰ Last chance! {eventTitle} tomorrow at {venue}\n\n🎫 Limited tickets available\n📅 {date} | Doors: {time}\n\nGet yours now: {link}\n\n#Event #Tickets',
    category: 'reminder',
    variables: ['eventTitle', 'venue', 'date', 'time', 'link']
  },
  {
    id: 'afterparty',
    name: 'Afterparty Announcement',
    template: '🎉 Party continues! Join us for the afterparty at {venue}\n\n🥂 {eventTitle}\n📅 {date} from {time}\n🎶 DJ {djName}\n\nFree entry for event guests!\n\n#Afterparty #Nightlife',
    category: 'afterparty',
    variables: ['venue', 'eventTitle', 'date', 'time', 'djName']
  }
]

export function getTemplatesByCategory(category: string): EventTemplate[] {
  return TWITTER_TEMPLATES.filter(template => template.category === category)
}

export function getTemplateById(id: string): EventTemplate | undefined {
  return TWITTER_TEMPLATES.find(template => template.id === id)
}

export function renderTemplate(template: EventTemplate, variables: Record<string, string>): string {
  let result = template.template

  // Replace variables
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }

  return result
}
