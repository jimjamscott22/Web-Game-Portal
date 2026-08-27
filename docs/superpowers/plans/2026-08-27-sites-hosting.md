# PixelPlay Sites Hosting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the existing ten-game PixelPlay application as an owner-only OpenAI Sites deployment without changing gameplay or the visual system.

**Architecture:** Keep the React application rooted in `app/`, retain its HashRouter and client-side local storage, and add the Sites Vite adapter needed to produce Cloudflare Worker-compatible ESM output. Build and validate the exact source locally, then create one Sites project, persist only its project ID, save one packaged version, and privately deploy it.

**Tech Stack:** React 19.2, TypeScript 5.9, Vite 8.2, `@vitejs/plugin-react` 6.1, `@openai/sites-vite-plugin` 0.2, OpenAI Sites, Cloudflare Workers-compatible ESM

**Spec:** `docs/superpowers/specs/2026-08-27-sites-hosting-design.md`

## Global Constraints

- Preserve all ten existing games, hash-based routes, themes, animations, responsive controls, and locally stored scores or preferences.
- Do not add accounts, databases, uploads, shared persistence, new games, a separate marketing site, or a visual redesign.
- Keep `app/` as the application root and preserve npm plus the checked-in lockfile.
- Keep `.openai/hosting.json` limited to the generated `project_id`; do not commit credentials or environment-specific values.
- Surface type, build, packaging, and deployment failures explicitly.
- Publish the initial Sites version with owner-only access.

---

## File Map

- `app/package.json`: declares the compatible Vite toolchain and Sites adapter.
- `app/package-lock.json`: locks the hosting-compatible dependency graph.
- `app/vite.config.ts`: composes the Sites adapter with the existing React and inspection plugins.
- `app/index.html`: owns PixelPlay document, Open Graph, and X metadata.
- `app/public/og.png`: contains the generated landscape social card matching the deployed PixelPlay brand.
- `app/tests/hostingConfig.test.ts`: verifies the checked-in hosting configuration and metadata contract.
- `app/.openai/hosting.json`: stores the Sites project ID returned by the one-time site creation call.

### Task 1: Add The Hosting Compatibility Contract

**Files:**
- Create: `app/tests/hostingConfig.test.ts`
- Modify: `app/package.json`
- Modify: `app/package-lock.json`
- Modify: `app/vite.config.ts`

**Interfaces:**
- Consumes: the existing Vite config and npm build flow in `app/`.
- Produces: a `sites()` Vite plugin configuration whose production build emits `app/dist/server/index.js` and static assets suitable for Sites packaging.

- [ ] **Step 1: Write the failing hosting configuration test**

Create `app/tests/hostingConfig.test.ts` with Node's built-in test runner. Read `package.json` and `vite.config.ts`, then assert:

```ts
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('declares the Sites-compatible Vite toolchain', async () => {
  const packageJson = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  const viteConfig = await readFile(new URL('vite.config.ts', root), 'utf8');

  assert.equal(packageJson.devDependencies['@openai/sites-vite-plugin'], '^0.2.0');
  assert.equal(packageJson.devDependencies['@vitejs/plugin-react'], '^6.1.0');
  assert.equal(packageJson.devDependencies.vite, '^8.2.2');
  assert.match(viteConfig, /import\s+\{\s*sites\s*\}\s+from\s+['"]@openai\/sites-vite-plugin['"]/);
  assert.match(viteConfig, /plugins:\s*\[sites\(\)/);
});
```

- [ ] **Step 2: Run the test and verify the contract is absent**

Run: `cd app && node --experimental-strip-types --test tests/hostingConfig.test.ts`

Expected: FAIL because the Sites dependency and `sites()` configuration are not present.

- [ ] **Step 3: Install the current compatible hosting toolchain**

Run: `cd app && npm install --save-dev @openai/sites-vite-plugin@0.2.0 vite@8.2.2 @vitejs/plugin-react@6.1.0`

Expected: `package.json` and `package-lock.json` record the exact compatible releases without peer-dependency errors.

- [ ] **Step 4: Configure the Sites adapter**

Update `app/vite.config.ts` so the adapter is imported and executes first while the current port, alias, React plugin, and inspection plugin remain intact:

```ts
import path from 'path';
import { sites } from '@openai/sites-vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { inspectAttr } from 'kimi-plugin-inspect-react';

export default defineConfig({
  base: './',
  plugins: [sites(), inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 5: Run the focused contract and production build**

Run: `cd app && node --experimental-strip-types --test tests/hostingConfig.test.ts && npm run build`

Expected: the test passes, TypeScript succeeds, and the build creates `app/dist/server/index.js` plus emitted static assets.

- [ ] **Step 6: Commit the hosting adapter**

```bash
git add app/package.json app/package-lock.json app/vite.config.ts app/tests/hostingConfig.test.ts
git commit -m "build: prepare PixelPlay for Sites hosting"
```

### Task 2: Add PixelPlay Sharing Metadata

**Files:**
- Create: `app/.openai/hosting.json`
- Modify: `app/tests/hostingConfig.test.ts`
- Modify: `app/index.html`
- Create: `app/public/og.png`

**Interfaces:**
- Consumes: the existing PixelPlay title, description, Harvest palette, Caprasimo display typography, representative game imagery, and the trusted deployment origin returned by Sites.
- Produces: site-wide metadata referencing an absolute deployment-origin `/og.png` URL and one branded 1200 by 630 pixel social card.

- [ ] **Step 1: Create the Sites project exactly once**

Confirm `app/.openai/hosting.json` does not exist, then call Sites `create_site` with the PixelPlay name and an appropriate `pixelplay`-based slug. Treat quota, access, or permission errors as terminal and do not call `create_site` again. Retain the exact trusted deployment origin and source write credential returned by the call for the remaining steps.

- [ ] **Step 2: Persist only the returned project ID**

Create `app/.openai/hosting.json` containing one `project_id` property whose value is the exact opaque ID returned by Sites. Do not store the source write credential, URL, secrets, D1, or R2 fields.

- [ ] **Step 3: Extend the failing metadata contract**

Add this test to `app/tests/hostingConfig.test.ts` before editing `index.html`:

```ts
test('publishes complete PixelPlay social metadata', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');

  assert.match(html, /<title>PixelPlay \| Ten Free Browser Games<\/title>/);
  assert.match(html, /name="description" content="Play 2048, Minesweeper, Snake, Tetris, Sudoku, and five more free games in the PixelPlay browser arcade\."/);
  assert.match(html, /property="og:title" content="PixelPlay \| Ten Free Browser Games"/);
  assert.match(html, /property="og:description"/);
  assert.match(html, /property="og:image" content="https:\/\/[^\"]+\/og\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(html, /name="twitter:image" content="https:\/\/[^\"]+\/og\.png"/);
});
```

- [ ] **Step 4: Run the test and verify the metadata is incomplete**

Run: `cd app && node --experimental-strip-types --test tests/hostingConfig.test.ts`

Expected: the hosting test passes and the metadata test fails at the current document title.

- [ ] **Step 5: Start the retained development server and verify the first meaningful preview**

Run: `cd app && npm run dev -- --host 127.0.0.1`

Keep the process running. Make one request to the exact URL printed by Vite and require a successful non-error response. Open that URL once in the Codex browser and retain its tab ID for the final deployed handoff. Do not perform visual QA.

- [ ] **Step 6: Generate one branded social card**

After the preview gate passes, dispatch exactly one image-generation worker with only this brief: create one 1200 by 630 landscape PixelPlay social card using the Harvest cream, terracotta, sage, and ink palette; include the exact legible title `PixelPlay` and supporting line `Ten free games. One playful arcade.`; use crisp game-tile motifs for 2048, Snake, Tetris, and Minesweeper; do not edit the site or call Sites tools. Inspect the returned image once, retry at most once if its text is incorrect, then save the accepted asset as `app/public/og.png`.

- [ ] **Step 7: Add the exact site-wide metadata**

Replace the current title and add the following entries in `app/index.html`:

```html
<title>PixelPlay | Ten Free Browser Games</title>
<meta name="description" content="Play 2048, Minesweeper, Snake, Tetris, Sudoku, and five more free games in the PixelPlay browser arcade." />
<meta property="og:type" content="website" />
<meta property="og:title" content="PixelPlay | Ten Free Browser Games" />
<meta property="og:description" content="Play 2048, Minesweeper, Snake, Tetris, Sudoku, and five more free games in the PixelPlay browser arcade." />
<meta property="og:image" content="TRUSTED_SITES_ORIGIN/og.png" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="PixelPlay | Ten Free Browser Games" />
<meta name="twitter:description" content="Play 2048, Minesweeper, Snake, Tetris, Sudoku, and five more free games in the PixelPlay browser arcade." />
<meta name="twitter:image" content="TRUSTED_SITES_ORIGIN/og.png" />
```

Replace `TRUSTED_SITES_ORIGIN` in both entries with the exact HTTPS deployment origin returned by `create_site`; do not derive it from forwarded request headers or retain the marker in source.

- [ ] **Step 8: Run metadata, game-logic, and build validation**

Run: `cd app && node --experimental-strip-types --test tests/hostingConfig.test.ts tests/gameLogic.test.ts && npm run build`

Expected: all Node tests pass, TypeScript succeeds, and the final build recreates `app/dist/server/index.js` with `/og.png` in its static output.

- [ ] **Step 9: Commit the complete validated site source and hosting identity**

```bash
git add app/.openai/hosting.json app/index.html app/public/og.png app/tests/hostingConfig.test.ts
git commit -m "feat: connect PixelPlay to Sites"
```

### Task 3: Save And Privately Deploy The Validated Site

**Files:**
- Package: `/tmp/pixelplay-sites.tar.gz`

**Interfaces:**
- Consumes: the validated Git branch-head SHA, `app/dist/`, and the retained credential returned by the one-time Sites project creation in Task 2.
- Produces: one saved Sites version and a successful owner-only production deployment URL.

- [ ] **Step 1: Push the exact validated source state**

Use the write credential returned by `create_site` as a per-command HTTP authorization header and push the current branch head to the Sites source repository. Do not put the credential in Git remotes or configuration. Capture the pushed branch-head SHA with `git rev-parse HEAD`; this exact value is the version's `commit_sha`.

- [ ] **Step 2: Package the validated output**

Run the Sites plugin's `scripts/package-site.sh` helper with `app/` as the project directory and `/tmp/pixelplay-sites.tar.gz` as the archive path.

Expected: the helper accepts `dist/server/index.js`, static assets, and `dist/.openai/hosting.json`, then produces the archive without validation errors.

- [ ] **Step 3: Save one Sites version**

Call Sites `save_site_version` once with the returned project ID, the exact pushed `commit_sha`, and `/tmp/pixelplay-sites.tar.gz`.

Expected: Sites returns an opaque version ID for the packaged source and output.

- [ ] **Step 4: Deploy the owner-only version**

Call Sites `deploy_private_site_version` with the project ID and saved version ID. Poll `get_deployment_status` directly until the status is `succeeded` or a terminal failure is reported.

- [ ] **Step 5: Hand off the deployed site**

Reuse the retained PixelPlay browser tab and open the exact successful deployment URL there. Stop the retained local development server. Report the deployed Sites URL and the ten-game PixelPlay experience as the final deliverable.

## Final Review Checklist

- [ ] The implementation matches every scope and success requirement in the approved spec.
- [ ] The hosting configuration test, existing game-logic tests, and production build all pass from `app/`.
- [ ] `app/dist/server/index.js`, static assets, and packaged hosting metadata exist.
- [ ] Git contains no credentials, archive files, or unrelated changes.
- [ ] Sites reports a successful owner-only deployment and the exact deployed URL is opened in the retained tab.
