/**
 * Reddit Platform Token Definitions
 * 
 * Defines semantic tokens for the Reddit platform with Light/Dark mode variants.
 * Tokens are resolved by the TokenResolver based on darkMode state.
 * 
 * @module platforms/reddit/tokens
 */

export interface TokenValue {
  light: string
  dark: string
}

export interface RedditTokenMap {
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
 * Reddit Platform Token Map
 * 
 * Semantic tokens for Reddit platform styling.
 * Each token has Light and Dark mode variants.
 */
export const redditTokens: RedditTokenMap = {
  surface: {
    primary: {
      light: '#ffffff',
      dark: '#1a1a1b'
    },
    secondary: {
      light: '#f7f7f8',
      dark: '#272729'
    },
    default: {
      light: '#f7f7f8',
      dark: '#030303'
    }
  },
  text: {
    primary: {
      light: '#1a1a1b',
      dark: '#d7dadc'
    },
    secondary: {
      light: '#7c7c7c',
      dark: '#818384'
    }
  },
  accent: {
    brand: {
      light: '#ff4500',
      dark: '#ff4500'  // Reddit orange stays the same
    }
  },
  border: {
    default: {
      light: '#e0e0e0',
      dark: '#343536'
    },
    divider: {
      light: '#e0e0e0',
      dark: '#343536'
    }
  }
}

