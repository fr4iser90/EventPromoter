/**
 * LinkedIn Platform Token Definitions
 * 
 * Defines semantic tokens for the LinkedIn platform with Light/Dark mode variants.
 * Tokens are resolved by the TokenResolver based on darkMode state.
 * 
 * @module platforms/linkedin/tokens
 */

export interface TokenValue {
  light: string
  dark: string
}

export interface LinkedInTokenMap {
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
 * LinkedIn Platform Token Map
 * 
 * Semantic tokens for LinkedIn platform styling.
 * Each token has Light and Dark mode variants.
 */
export const linkedinTokens: LinkedInTokenMap = {
  surface: {
    primary: {
      light: '#ffffff',
      dark: '#0a0a0a'
    },
    secondary: {
      light: '#f3f2ef',
      dark: '#1d1d1d'
    },
    default: {
      light: '#f3f2ef',
      dark: '#000000'
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
      light: '#0a66c2',
      dark: '#0a66c2'  // LinkedIn blue stays the same
    }
  },
  border: {
    default: {
      light: '#e0e0e0',
      dark: '#3d3d3d'
    },
    divider: {
      light: '#e0e0e0',
      dark: '#3d3d3d'
    }
  }
}

