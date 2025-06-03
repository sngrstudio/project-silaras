// @ts-check
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import icons from 'unplugin-icons/vite'

// https://astro.build/config
export default defineConfig({
  site: 'https://staging.silaraskotim.com',
  integrations: [react()],
  image: {
    domains: []
  },
  adapter: node({
    mode: 'middleware'
  }),
  output: 'server',
  vite: {
    plugins: [tailwindcss(), icons({ compiler: 'jsx', jsx: 'react' })]
  },
  experimental: {
    responsiveImages: true
  }
})
