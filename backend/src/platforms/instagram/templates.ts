// Instagram content templates

export interface InstagramTemplate {
  id: string
  name: string
  template: string
  category: string
  variables: string[]
}

export const INSTAGRAM_TEMPLATES: InstagramTemplate[] = [
  {
    id: 'event-announcement',
    name: 'Event Announcement',
    template: '🎶 {eventTitle}\n\n📅 {date} | {time}\n📍 {venue}, {city}\n\n{description}\n\n#Event #Nightlife #Music',
    category: 'announcement',
    variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description']
  }
]

export function getTemplatesByCategory(category: string): InstagramTemplate[] {
  return INSTAGRAM_TEMPLATES.filter(template => template.category === category)
}

export function renderTemplate(template: InstagramTemplate, variables: Record<string, string>): string {
  let result = template.template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return result
}
