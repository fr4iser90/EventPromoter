/**
 * Facebook Platform Token Definitions
 * 
 * Defines semantic tokens for the Facebook platform with Light/Dark mode variants.
 * Tokens are resolved by the TokenResolver based on darkMode state.
 * 
 * @module platforms/facebook/tokens
 */

export interface TokenValue {
  light: string
  dark: string
}

export interface FacebookTokenMap {
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
 * Facebook Platform Token Map
 * 
 * Semantic tokens for Facebook platform styling.
 * Each token has Light and Dark mode variants.
 */
export const facebookTokens: FacebookTokenMap = {
  surface: {
    primary: {
      light: '#ffffff',
      dark: '#18191a'
    },
    secondary: {
      light: '#f0f2f5',
      dark: '#242526'
    },
    default: {
      light: '#f0f2f5',
      dark: '#000000'
    }
  },
  text: {
    primary: {
      light: '#050505',
      dark: '#e4e6eb'
    },
    secondary: {
      light: '#65676b',
      dark: '#b0b3b8'
    }
  },
  accent: {
    brand: {
      light: '#1877f2',
      dark: '#1877f2'  // Facebook blue stays the same
    }
  },
  border: {
    default: {
      light: '#e0e0e0',
      dark: '#3a3b3c'
    },
    divider: {
      light: '#e0e0e0',
      dark: '#3a3b3c'
    }
  }
}

