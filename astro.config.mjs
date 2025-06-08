// @ts-check
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import icons from 'unplugin-icons/vite'
import pwa from '@vite-pwa/astro'

// https://astro.build/config
export default defineConfig({
  site: 'https://www.silaraskotim.com',
  integrations: [
    react(),
    pwa({
      registerType: 'autoUpdate',
      manifest: false,
      strategies: 'injectManifest',
      srcDir: 'src/scripts/pwa',
      filename: 'sw.ts',
      pwaAssets: {
        config: true
      }
    })
  ],
  adapter: node({
    mode: 'middleware'
  }),
  output: 'server',
  vite: {
    plugins: [tailwindcss(), icons({ compiler: 'jsx', jsx: 'react' })]
  }
})
