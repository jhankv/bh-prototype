import { existsSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const root = import.meta.dirname

/**
 * "@/…" means three different roots in this repo: the shell's src/, and each
 * source-installed design system under sandboxes/. The Banhaten CLI writes
 * "@/lib/utils" into its components and treats "@" as ITS project root.
 *
 * resolve.alias cannot express that — it is global, and Rolldown applies it in
 * the native resolver before any JS plugin runs, so a "pre" plugin never sees
 * the import. So "@" is not aliased at all; this plugin owns it entirely and
 * picks the root from whichever package the importing file belongs to.
 */
const RESOLVE_SUFFIXES = ['', '.tsx', '.ts', '.jsx', '.js', '.css', '/index.tsx', '/index.ts']

function scopedAtAlias(): Plugin {
  return {
    name: 'scoped-at-alias',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.startsWith('@/')) return null

      const owner = importer?.replace(/\\/g, '/').match(/\/sandboxes\/([^/]+)\//)

      const base = owner
        ? resolve(root, 'sandboxes', owner[1], source.slice(2))
        : resolve(root, 'src', source.slice(2))

      for (const suffix of RESOLVE_SUFFIXES) {
        const candidate = base + suffix
        if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
      }

      return null
    },
  }
}

export default defineConfig({
  plugins: [
    scopedAtAlias(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    // Sandboxes are workspace packages. Without this, pnpm can hand them a
    // second React instance and every hook inside a component breaks.
    dedupe: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, 'index.html'),
        frame: resolve(root, 'frame.html'),
      },
    },
  },
})
