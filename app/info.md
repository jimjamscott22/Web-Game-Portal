Use Node.js 22.13+ (required by the Sites plugin). The application uses
React 19, Tailwind CSS 4, Vite 8, and the Cloudflare Vite plugin.

Run commands from `app/`:

```sh
npm ci
npm run dev       # http://localhost:3000
npm run build    # TypeScript checks, then client and Worker builds
npm run lint
npm run test     # Node test runner with tsx
npm audit
```

Tailwind runs through `@tailwindcss/vite`. `src/index.css` imports Tailwind
and explicitly loads `tailwind.config.js`, preserving the portal's skin
tokens, fonts, shadows, and animations. There is no PostCSS configuration.

Install scripts are controlled by the version-pinned `allowScripts` entries
in `package.json`. Review blocked scripts with `npm install-scripts ls` after
dependency updates. A user-level `.npmrc` `allow-scripts` setting is ignored
when this project policy exists; npm warns about that precedence.

Generated shadcn UI files retain their upstream implementation. ESLint allows
their named variant/context exports. Two file-scoped compatibility exceptions
cover the carousel's Embla synchronization effect and the sidebar skeleton's
decorative random width. Application components retain the full hook rules.

Components (40+):
  accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb,
  button-group, button, calendar, card, carousel, chart, checkbox, collapsible,
  command, context-menu, dialog, drawer, dropdown-menu, empty, field, form,
  hover-card, input-group, input-otp, input, item, kbd, label, menubar,
  navigation-menu, pagination, popover, progress, radio-group, resizable,
  scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner,
  spinner, switch, table, tabs, textarea, toggle-group, toggle, tooltip

Usage:
  import { Button } from '@/components/ui/button'
  import { Card, CardHeader, CardTitle } from '@/components/ui/card'

Structure:
  src/sections/        Page sections
  src/hooks/           Custom hooks
  src/types/           Type definitions
  src/App.css          Styles specific to the Webapp
  src/App.tsx          Root React component
  src/index.css        Global styles
  src/main.tsx         Entry point for rendering the Webapp
  index.html           Entry point for the Webapp
  tailwind.config.js   Configures Tailwind's theme, plugins, etc.
  vite.config.ts       Main build and dev server settings for Vite
