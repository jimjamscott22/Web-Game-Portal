import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);

test('declares the Sites-compatible Vite toolchain', async () => {
  const packageJson = JSON.parse(
    await readFile(new URL('package.json', root), 'utf8'),
  );
  const viteConfig = await readFile(new URL('vite.config.ts', root), 'utf8');

  assert.equal(
    packageJson.devDependencies['@openai/sites-vite-plugin'],
    '^0.2.0',
  );
  // Sites requires Vite 8; plugin-react 6 supports that major. Patch releases
  // should not require rewriting this integration contract.
  assert.match(packageJson.devDependencies['@vitejs/plugin-react'], /^\^6\./);
  assert.match(packageJson.devDependencies.vite, /^\^8\./);
  assert.match(
    viteConfig,
    /import\s+\{\s*sites\s*\}\s+from\s+['"]@openai\/sites-vite-plugin['"]/,
  );
  assert.match(viteConfig, /sites\(\)/);
  assert.match(viteConfig, /viteEnvironment:\s*\{\s*name:\s*["']server["']/);
  assert.match(viteConfig, /config:\s*workerConfig/);
  assert.match(viteConfig, /not_found_handling:\s*["']single-page-application["']/);
});

test('loads the existing theme through the Tailwind 4 Vite integration', async () => {
  const viteConfig = await readFile(new URL('vite.config.ts', root), 'utf8');
  const css = await readFile(new URL('src/index.css', root), 'utf8');
  const theme = await import(new URL('tailwind.config.js', root).href);

  assert.match(viteConfig, /import tailwindcss from ['"]@tailwindcss\/vite['"]/);
  assert.match(viteConfig, /tailwindcss\(\)/);
  assert.match(css, /@import "tailwindcss"/);
  assert.match(css, /@config "\.\.\/tailwind.config.js"/);
  assert.equal(theme.default.theme.extend.colors.ground, 'var(--t-bg)');
  assert.equal(theme.default.theme.extend.colors.accent.DEFAULT, 'var(--t-accent)');
});

test('publishes complete PixelPlay page metadata', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');

  assert.match(html, /<title>PixelPlay \| Eleven Free Browser Games<\/title>/);
  assert.match(
    html,
    /name="description" content="Play 2048, Minesweeper, Snake, Tetris, Sudoku, RoboRoute, and five more free games in the PixelPlay browser arcade\."/,
  );
  assert.match(
    html,
    /property="og:title" content="PixelPlay \| Eleven Free Browser Games"/,
  );
  assert.match(html, /property="og:description"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(
    html,
    /name="twitter:title" content="PixelPlay \| Eleven Free Browser Games"/,
  );
  assert.match(
    html,
    /property="og:image" content="https:\/\/pixelplay-web-game-portal\.jimjam6579\.chatgpt\.site\/og-eleven\.png"/,
  );
  assert.match(
    html,
    /name="twitter:image" content="https:\/\/pixelplay-web-game-portal\.jimjam6579\.chatgpt\.site\/og-eleven\.png"/,
  );
});

test('includes RoboRoute production art in the public package', async () => {
  const sprite = await stat(new URL('public/assets/roboroute-sprite-sheet.png', root));
  const preview = await stat(new URL('public/assets/card-preview-roboroute.png', root));
  const socialPreview = await stat(new URL('public/og-eleven.png', root));

  assert.ok(sprite.size > 10_000);
  assert.ok(preview.size > 10_000);
  assert.ok(socialPreview.size > 10_000);
});
