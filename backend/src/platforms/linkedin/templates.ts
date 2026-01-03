// LinkedIn content templates

export interface LinkedInTemplate {
  id: string
  name: string
  template: string
  category: string
  variables: string[]
}

export const LINKEDIN_TEMPLATES: LinkedInTemplate[] = [
  {
    id: 'professional-event',
    name: 'Professional Event Announcement',
    template: '📅 {eventTitle}\n\nJoin us for an exciting event on {date} at {time}.\n\n📍 Location: {venue}, {city}\n\n{description}\n\n#Event #Networking #ProfessionalDevelopment',
    category: 'announcement',
    variables: ['eventTitle', 'date', 'time', 'venue', 'city', 'description']
  }
]

export function renderTemplate(template: LinkedInTemplate, variables: Record<string, string>): string {
  let result = template.template
  for (const [key, value] of Object.entries(variables)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return result
}
