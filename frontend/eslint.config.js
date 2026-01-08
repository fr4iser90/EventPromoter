import js from '@eslint/js'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import i18next from 'eslint-plugin-i18next'
import globals from 'globals'

export default [
  { ignores: ['dist'] },
  {
    files: ['src/**/*.{js,jsx}'], // Only apply to src directory
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      i18next,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // i18next rules - FOCUSED MODE for JSX only
      'i18next/no-literal-string': [
        'error', // Make it error to force fixing
        {
          mode: 'jsx-only', // Only check JSX, not JavaScript objects
          'jsx-attributes': {
            include: ['label', 'placeholder', 'title', 'alt', 'text', 'description', 'helperText', 'error'], // UI text attributes
          },
          words: {
            exclude: [
              '^[A-Z_]+$', // Constants and acronyms
              '^[a-z]{1,2}$', // Very short words (a, an, is, etc.)
            ],
          },
          ignore: [
            // HTML/SVG tags
            'div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'img', 'svg', 'path',
            // React components
            'Fragment', 'Suspense', 'ErrorBoundary', 'Portal',
            // JavaScript literals
            'true', 'false', 'null', 'undefined', 'NaN',
            // Theme values and CSS
            'light', 'dark', 'primary', 'secondary', 'error', 'warning', 'info', 'success',
            'main', 'contrastText', 'background', 'paper', 'default',
            '#[0-9a-fA-F]{3,6}', // Hex colors
            'rgb\\([^)]+\\)', 'rgba\\([^)]+\\)', // RGB colors
            'hsl\\([^)]+\\)', 'hsla\\([^)]+\\)', // HSL colors
            '\\d+px', '\\d+rem', '\\d+em', '\\d+%', 'vh', 'vw', 'vmin', 'vmax', // Measurements
            'solid', 'dashed', 'dotted', 'none', 'hidden', 'visible', 'auto', // CSS values
            // Numbers
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '20', '30', '50', '100',
            // React keys and IDs (common patterns)
            '^[a-z-]+$', // kebab-case
            '^_[a-zA-Z]+$', // private variables
            'key', 'id', 'ref', 'className', 'style', 'sx', 'variant', 'size', 'color',
            // Component names and technical terms
            'Container', 'Grid', 'Box', 'Paper', 'Typography', 'Button', 'TextField', 'Select',
            'MenuItem', 'Dialog', 'Modal', 'Alert', 'Chip', 'Avatar', 'Icon', 'Badge',
            // File extensions and tech terms
            'js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'html', 'json', 'md', 'pdf', 'jpg', 'png',
            'api', 'src', 'dist', 'build', 'node_modules', 'public', 'assets',
            // Common abbreviations and technical terms
            'id', 'url', 'uri', 'api', 'db', 'ui', 'ux', 'qa', 'dev', 'prod', 'env', 'config',
            'props', 'state', 'data', 'items', 'list', 'array', 'object', 'string', 'number', 'boolean',
            // Platform/component keys
            'reddit', 'twitter', 'facebook', 'instagram', 'linkedin', 'email', 'tiktok', 'youtube',
            // Workflow states
            'initial', 'files_uploaded', 'platforms_selected', 'content_ready', 'publishing', 'published',
            // HTTP methods
            'GET', 'POST', 'PUT', 'DELETE', 'PATCH',
            // Common UI terms
            'auto', 'none', 'block', 'flex', 'grid', 'inline', 'hidden', 'visible',
            // Material-UI specific
            'outlined', 'contained', 'text', 'small', 'medium', 'large', 'xs', 'sm', 'md', 'lg', 'xl',
          ],
          ignoreCallee: [
            // Allow console methods (for debugging)
            'console.log', 'console.warn', 'console.error', 'console.info',
            // Allow certain utility functions
            'JSON.stringify', 'JSON.parse',
          ],
        },
      ],
    },
  },
]
