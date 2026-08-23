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

/**
 * Audit documents are MDX so a claim and the evidence for it can share a
 * paragraph — see AGENTS.md. Compiling here rather than pulling in
 * @mdx-js/rollup keeps one less plugin between us and Rolldown, and this repo
 * already owns a resolver plugin, so the pattern is not new.
 *
 * `providerImportSource` is what lets a document use <Compare> without an
 * import line — and that is not a convenience. An import inside a document
 * would be a static ESM import of a design system path, the one thing views are
 * forbidden from doing, and it would bind the document to a single sandbox at
 * build time.
 */
function mdx(): Plugin {
  return {
    name: 'mdx-documents',
    enforce: 'pre',
    async transform(code, id) {
      if (!id.endsWith('.mdx')) return null

      const { compile } = await import('@mdx-js/mdx')
      const { default: remarkGfm } = await import('remark-gfm')

      // Emit calls to the automatic JSX runtime rather than JSX itself. Vite's
      // oxc transform does not treat .mdx as a JSX-bearing extension, so leaving
      // JSX in the output fails to parse before any React plugin sees it.
      const compiled = await compile(code, {
        jsxRuntime: 'automatic',
        providerImportSource: '@/frame/mdx/provider',
        // Plain MDX is CommonMark, which has no tables. The .md renderer has
        // carried remark-gfm all along, so a document gained or lost its tables
        // depending on its extension — silently, since an unparsed table renders
        // as a paragraph of pipes rather than as an error. Measured on the notes
        // document at the moment it became .mdx: eleven tables, none rendered.
        remarkPlugins: [remarkGfm],
      })

      return { code: String(compiled), map: null }
    },
  }
}

export default defineConfig({
  plugins: [
    scopedAtAlias(),
    mdx(),
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
