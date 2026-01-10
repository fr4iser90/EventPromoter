/**
 * Instagram Platform Token Definitions
 * 
 * Defines semantic tokens for the Instagram platform with Light/Dark mode variants.
 * Tokens are resolved by the TokenResolver based on darkMode state.
 * 
 * @module platforms/instagram/tokens
 */

export interface TokenValue {
  light: string
  dark: string
}

export interface InstagramTokenMap {
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
 * Instagram Platform Token Map
 * 
 * Semantic tokens for Instagram platform styling.
 * Each token has Light and Dark mode variants.
 */
export const instagramTokens: InstagramTokenMap = {
  surface: {
    primary: {
      light: '#ffffff',
      dark: '#000000'
    },
    secondary: {
      light: '#fafafa',
      dark: '#1a1a1a'
    },
    default: {
      light: '#fafafa',
      dark: '#000000'
    }
  },
  text: {
    primary: {
      light: '#262626',
      dark: '#ffffff'
    },
    secondary: {
      light: '#8e8e8e',
      dark: '#a8a8a8'
    }
  },
  accent: {
    brand: {
      light: '#e4405f',
      dark: '#e4405f'  // Instagram pink stays the same
    }
  },
  border: {
    default: {
      light: '#dbdbdb',
      dark: '#262626'
    },
    divider: {
      light: '#dbdbdb',
      dark: '#262626'
    }
  }
}

