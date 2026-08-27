import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
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
  assert.equal(packageJson.devDependencies['@vitejs/plugin-react'], '^5.1.1');
  assert.equal(packageJson.devDependencies.vite, '^8.2.2');
  assert.match(
    viteConfig,
    /import\s+\{\s*sites\s*\}\s+from\s+['"]@openai\/sites-vite-plugin['"]/,
  );
  assert.match(viteConfig, /sites\(\)/);
  assert.match(viteConfig, /viteEnvironment:\s*\{\s*name:\s*["']server["']/);
  assert.match(viteConfig, /config:\s*workerConfig/);
  assert.match(viteConfig, /not_found_handling:\s*["']single-page-application["']/);
});

test('publishes complete PixelPlay page metadata', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');

  assert.match(html, /<title>PixelPlay \| Ten Free Browser Games<\/title>/);
  assert.match(
    html,
    /name="description" content="Play 2048, Minesweeper, Snake, Tetris, Sudoku, and five more free games in the PixelPlay browser arcade\."/,
  );
  assert.match(
    html,
    /property="og:title" content="PixelPlay \| Ten Free Browser Games"/,
  );
  assert.match(html, /property="og:description"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.match(
    html,
    /name="twitter:title" content="PixelPlay \| Ten Free Browser Games"/,
  );
  assert.match(
    html,
    /property="og:image" content="https:\/\/pixelplay-web-game-portal\.jimjam6579\.chatgpt\.site\/og\.png"/,
  );
  assert.match(
    html,
    /name="twitter:image" content="https:\/\/pixelplay-web-game-portal\.jimjam6579\.chatgpt\.site\/og\.png"/,
  );
});
