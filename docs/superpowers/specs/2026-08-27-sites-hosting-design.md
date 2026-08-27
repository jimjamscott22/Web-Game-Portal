# PixelPlay Sites Hosting Design

## Goal

Publish the existing Web-Game-Portal application as a privately accessible
Sites deployment. The deployed product remains PixelPlay: a responsive arcade
containing the ten games already implemented in the repository.

## Scope

The hosting work will preserve the current application experience, including
its routes, game logic, themes, animations, responsive controls, and locally
stored progress or scores. It will not introduce accounts, shared persistence,
new games, a separate marketing site, or a visual redesign.

## Architecture

The existing React and TypeScript application remains rooted in `app/` and
continues to use Vite and hash-based routing. The Vite build will be adapted to
produce Cloudflare Worker-compatible output through the Sites Vite plugin.
Sites hosting metadata will live alongside the application and contain only
the generated Sites project identifier; no secrets or environment-specific
values will be committed.

All gameplay remains client-side. Browser storage continues to hold local
preferences and scores, so no database, authentication, or upload capability
is required.

## Presentation And Metadata

The deployed site will retain the current PixelPlay home page and game cards as
its primary surface. The document title, description, Open Graph fields, and X
card fields will identify the site as PixelPlay and describe its ten free
browser games. An existing suitable branded image will be reused for the social
preview when it accurately represents the deployed experience; otherwise a
single matching preview asset will be created and wired site-wide.

## Build And Hosting Flow

The existing development and production scripts remain the normal local entry
points. The hosting adapter will be additive and will not replace the current
source layout or package manager. A production build must succeed before the
validated output is packaged and saved as a Sites version. The initial
deployment will use owner-only access.

## Error Handling

Build, type, packaging, and deployment errors must surface as failures rather
than being hidden behind fallback content. A hosting failure will not alter the
working local application. Existing game-level behavior and local-storage
handling remain unchanged.

## Validation

Validation will include the production build, the existing targeted game-logic
tests, and a successful response from the local application before publishing.
The deployed version must reach a successful Sites status and open at the exact
deployed URL. Browser-driven visual inspection is outside this scope because it
was not requested.

## Success Criteria

- The existing ten-game PixelPlay experience builds without regressions.
- Sites receives the exact validated application output.
- The site is deployed with owner-only access.
- The deployed URL loads the PixelPlay application and supports its hash-based
  game routes.
- No accounts, databases, uploads, or unrelated product changes are added.
