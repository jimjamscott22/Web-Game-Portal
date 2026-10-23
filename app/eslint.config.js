import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },
  {
    files: ['src/components/ui/*.{ts,tsx}'],
    rules: {
      // shadcn's generated modules intentionally share variants and context hooks.
      'react-refresh/only-export-components': ['error', {
        allowConstantExport: true,
        allowExportNames: [
          'badgeVariants', 'buttonVariants', 'buttonGroupVariants',
          'toggleVariants', 'navigationMenuTriggerStyle', 'useFormField', 'useSidebar',
        ],
      }],
    },
  },
  {
    files: ['src/components/ui/carousel.tsx'],
    rules: {
      // Upstream Embla integration synchronizes scroll controls on API attachment.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    files: ['src/components/ui/sidebar.tsx'],
    rules: {
      // Upstream skeleton samples a decorative width once per mounted instance.
      'react-hooks/purity': 'off',
    },
  },
])
