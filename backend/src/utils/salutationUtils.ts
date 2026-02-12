import type { EmailRecipient } from '../platforms/email/types.js'

interface SalutationConfig {
  key: string
  data: Record<string, string>
}

/**
 * Resolves salutation translation key and interpolation data from target metadata.
 */
export function getSalutationConfig(target?: Partial<EmailRecipient>): SalutationConfig {
  const firstName = target?.firstName || ''
  const lastName = target?.lastName || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()

  const tone = target?.salutationTone || 'formal'
  const gender = target?.gender || 'not_specified'

  let key = 'salutation.formal.generic'
  if (tone === 'informal') {
    key = 'salutation.informal'
  } else if (gender === 'female') {
    key = 'salutation.formal.female'
  } else if (gender === 'male') {
    key = 'salutation.formal.male'
  } else if (gender === 'non_binary') {
    key = 'salutation.formal.nonBinary'
  }

  return {
    key,
    data: {
      firstName,
      lastName,
      fullName
    }
  }
}
