/**
 * Twitter Platform Token Definitions
 * 
 * Defines semantic tokens for the Twitter platform with Light/Dark mode variants.
 * Tokens are resolved by the TokenResolver based on darkMode state.
 * 
 * @module platforms/twitter/tokens
 */

export interface TokenValue {
  light: string
  dark: string
}

export interface TwitterTokenMap {
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
 * Twitter Platform Token Map
 * 
 * Semantic tokens for Twitter platform styling.
 * Each token has Light and Dark mode variants.
 */
export const twitterTokens: TwitterTokenMap = {
  surface: {
    primary: {
      light: '#ffffff',
      dark: '#000000'
    },
    secondary: {
      light: '#f7f9f9',
      dark: '#16181c'
    },
    default: {
      light: '#f7f9f9',
      dark: '#000000'
    }
  },
  text: {
    primary: {
      light: '#0f1419',
      dark: '#e7e9ea'
    },
    secondary: {
      light: '#536471',
      dark: '#71767b'
    }
  },
  accent: {
    brand: {
      light: '#1d9bf0',
      dark: '#1d9bf0'  // Twitter blue stays the same
    }
  },
  border: {
    default: {
      light: '#eff3f4',
      dark: '#2f3336'
    },
    divider: {
      light: '#eff3f4',
      dark: '#2f3336'
    }
  }
}

