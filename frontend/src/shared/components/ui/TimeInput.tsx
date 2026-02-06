import React from 'react'
import { TextField, TextFieldProps } from '@mui/material'

interface TimeInputProps extends Omit<TextFieldProps, 'value' | 'onChange'> {
  value: string // HH:MM format
  onChange: (time: string) => void // Returns HH:MM format
}

/**
 * TimeInput Component
 * 
 * Handles time input in 24h format (HH:MM)
 * Validates input format and ensures consistent 24h format
 * 
 * Usage:
 * ```tsx
 * <TimeInput
 *   value={parsedData.time} // HH:MM format
 *   onChange={(time) => handleFieldChange('time', time)}
 *   label="Time"
 *   fullWidth
 *   size="small"
 * />
 * ```
 */
const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  placeholder = 'HH:MM',
  ...textFieldProps
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty input
    if (!inputValue) {
      onChange('')
      return
    }
    
    // Validate HH:MM format - allow partial input while typing
    // Allow: "1", "12", "12:", "12:3", "12:30"
    const timePattern = /^(\d{1,2})?(:)?(\d{0,2})?$/
    if (timePattern.test(inputValue)) {
      onChange(inputValue)
    }
    // If input doesn't match pattern, don't update (prevents invalid input)
  }

  return (
    <TextField
      {...textFieldProps}
      value={value || ''}
      onChange={handleChange}
      placeholder={placeholder}
    />
  )
}

export default TimeInput
