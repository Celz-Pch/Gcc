import { fileURLToPath, URL } from 'node:url'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { createReadStream } from 'node:fs'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

const dataDir = resolve(process.cwd(), 'data')

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    {
      name: 'data-folder-api',
      configureServer(server) {
        server.middlewares.use('/api/files', (_req, res) => {
          try {
            const files = readdirSync(dataDir)
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(files))
          } catch {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify([]))
          }
        })

        server.middlewares.use('/data', (req, res, next) => {
          const fileName = req.url?.replace(/^\//, '') ?? ''
          if (!fileName) return next()
          const filePath = resolve(dataDir, fileName)
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
          const stream = createReadStream(filePath)
          stream.on('error', () => next())
          stream.pipe(res)
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
