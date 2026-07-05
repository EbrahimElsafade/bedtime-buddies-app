import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'
import { mcpPlugin } from '@lovable.dev/mcp-js/stacks/supabase/vite'
import fs from 'fs'

const httpsOptions = (() => {
  try {
    const keyPath = 'localhost+3-key.pem'
    const certPath = 'localhost+3.pem'

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
    }
  } catch (error) {
    console.log('HTTPS certificates not found, running on HTTP')
  }
  return false
})()

// https://vitejs.dev/config/
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
    ...(httpsOptions && { https: httpsOptions }),
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mcpPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version || '0.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __BUILD_MODE__: JSON.stringify(mode),
  },
}))
