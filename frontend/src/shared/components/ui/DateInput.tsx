import React from 'react'
import { TextField, TextFieldProps } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { convertISOToFormatted, convertFormattedToISO } from '../../utils/dateUtils'

interface DateInputProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string // ISO format (YYYY-MM-DD)
  onChange: (isoDate: string) => void // Returns ISO format
  locale?: string // Optional locale override
}

/**
 * DateInput Component
 * 
 * Automatically formats ISO dates for display based on user locale
 * Converts formatted input back to ISO when changed
 * 
 * This component ensures:
 * - Display: ISO → Locale-formatted (e.g., "2026-05-16" → "16.05.2026" for de-DE)
 * - Input: Locale-formatted → ISO (e.g., "16.05.2026" → "2026-05-16")
 * - Storage: Always ISO format (YYYY-MM-DD)
 * 
 * Usage:
 * ```tsx
 * <DateInput
 *   value={parsedData.date} // ISO format
 *   onChange={(isoDate) => handleFieldChange('date', isoDate)}
 *   label="Date"
 *   fullWidth
 *   size="small"
 * />
 * ```
 */
const DateInput: React.FC<DateInputProps> = ({
  value,
  onChange,
  locale,
  placeholder,
  ...textFieldProps
}) => {
  const { i18n } = useTranslation()
  const userLocale = locale || i18n.language

  // Get locale-specific placeholder
  const getPlaceholder = () => {
    if (placeholder) return placeholder
    if (userLocale.startsWith('de')) return 'DD.MM.YYYY'
    if (userLocale.startsWith('es')) return 'DD/MM/YYYY'
    return 'MM/DD/YYYY' // US format
  }

  // Convert ISO to formatted for display
  const displayValue = value ? convertISOToFormatted(value, userLocale) : ''

  // Handle change: convert formatted input back to ISO
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    if (!inputValue) {
      onChange('')
      return
    }
    
    // Convert formatted input to ISO
    const isoDate = convertFormattedToISO(inputValue)
    onChange(isoDate)
  }

  return (
    <TextField
      {...textFieldProps}
      value={displayValue}
      onChange={handleChange}
      placeholder={getPlaceholder()}
    />
  )
}

export default DateInput
