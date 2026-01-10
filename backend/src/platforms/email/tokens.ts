/**
 * Email Platform Token Definitions
 * 
 * Defines semantic tokens for the Email platform with Light/Dark mode variants.
 * Tokens are resolved by the TokenResolver based on darkMode state.
 * 
 * @module platforms/email/tokens
 */

export interface TokenValue {
  light: string
  dark: string
}

export interface EmailTokenMap {
  surface: {
    primary: TokenValue
    secondary: TokenValue
    default: TokenValue
  }
  text: {
    primary: TokenValue
    secondary: TokenValue
  }
  accent: {
    brand: TokenValue
  }
  border: {
    default: TokenValue
    divider: TokenValue
  }
}

/**
 * Email Platform Token Map
 * 
 * Semantic tokens for Email platform styling.
 * Each token has Light and Dark mode variants.
 */
export const emailTokens: EmailTokenMap = {
  surface: {
    primary: {
      light: '#ffffff',
      dark: '#1e1e1e'
    },
    secondary: {
      light: '#f5f5f5',
      dark: '#2d2d2d'
    },
    default: {
      light: '#f5f5f5',
      dark: '#121212'
    }
  },
  text: {
    primary: {
      light: '#000000',
      dark: '#ffffff'
    },
    secondary: {
      light: '#666666',
      dark: '#b0b0b0'
    }
  },
  accent: {
    brand: {
      light: '#1976d2',
      dark: '#1976d2'  // Primary color stays the same
    }
  },
  border: {
    default: {
      light: '#e0e0e0',
      dark: '#424242'
    },
    divider: {
      light: '#e0e0e0',
      dark: '#424242'
    }
  }
}

