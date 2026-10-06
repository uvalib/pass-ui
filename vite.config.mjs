import { resolve } from 'path';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

// Redirect v1 addon bare imports to their Embroider-rewritten versions.
// During `vite build`, Rollup resolves bare `ember-cli-deprecation-workflow`
// to the original node_modules index.js (broccoli plugin with
// `require('./package').name`) instead of the Embroider-rewritten ESM version.
// This plugin intercepts those imports.
function rewrittenV1Addons() {
  const rewrittenDir = resolve('./node_modules/.embroider/rewritten-packages/');
  const packages = ['ember-cli-deprecation-workflow'];
  let mapping = null;

  function getMapping() {
    if (mapping) return mapping;
    if (!existsSync(rewrittenDir)) return null;
    mapping = {};
    const entries = readdirSync(rewrittenDir);
    for (const pkg of packages) {
      const match = entries.find((e) => e.startsWith(pkg + '.'));
      if (match) {
        mapping[pkg] = resolve(rewrittenDir, match, 'node_modules', pkg, 'index.js');
      }
    }
    return mapping;
  }

  return {
    name: 'rewritten-v1-addons',
    enforce: 'pre',
    resolveId(source) {
      const m = getMapping();
      if (m?.[source]) {
        return m[source];
      }
    },
  };
}

export default defineConfig({
  base: '/app/',
  optimizeDeps: {
    exclude: ['survey-js-ui', '@playwright/test', 'playwright', 'playwright-core'],
  },
  preview: {
    allowedHosts: ['host.docker.internal'],
  },
  server: {
    host: true,
    allowedHosts: ['host.docker.internal'],
    watch: {
      ignored: ['**/tests/visual/**', '**/test-results/**', '**/playwright-report/**'],
    },
    proxy: {
      '/data': 'http://localhost:8080',
      '/user': 'http://localhost:8080',
      '/schema': 'http://localhost:8080',
      '/doi': 'http://localhost:8080',
      '/policy': 'http://localhost:8080',
      '/file': 'http://localhost:8080',
    },
  },
  plugins: [
    // When pass-core reverse-proxies to Vite, it overrides Content-Type headers
    // based on file extension. Paths like /@vite/client (no extension) get
    // application/octet-stream, and index.html?html-proxy gets text/html.
    // Rewrite these to absolute URLs so the browser loads them directly from Vite.
    {
      name: 'pass-core-proxy-compat',
      transformIndexHtml(html) {
        const viteOrigin = 'http://localhost:4200';
        return html
          .replace(/src="(\/app\/@vite\/client)"/g, `src="${viteOrigin}$1"`)
          .replace(/src="(\/app\/index\.html\?html-proxy[^"]*)"/g, `src="${viteOrigin}$1"`);
      },
    },
    // Serve /app/config.json for dev mode (production serves public/config.json from the image)
    {
      name: 'dev-config-json',
      configureServer(server) {
        server.middlewares.use('/app/config.json', (_req, res) => {
          res.setHeader('Content-Type', 'application/json');
          try {
            res.end(readFileSync(resolve('./public/app/config.json'), 'utf8'));
          } catch (error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Failed to read public/app/config.json' }));
          }
        });
      },
    },
    classicEmberSupport(),
    rewrittenV1Addons(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
});
