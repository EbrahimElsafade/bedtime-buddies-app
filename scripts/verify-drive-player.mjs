/**
 * Smoke checks for Google Drive player build artifacts.
 * Run after: npm run build
 */
import { readFileSync, existsSync, readdirSync } from 'fs'
import { join } from 'path'

const distAssets = join(process.cwd(), 'dist', 'assets')
const errors = []

if (!existsSync(distAssets)) {
  console.error('FAIL: dist/assets missing — run npm run build first')
  process.exit(1)
}

const cssFiles = readdirSync(distAssets).filter((f) => f.endsWith('.css'))
const cssBundle = cssFiles
  .map((f) => readFileSync(join(distAssets, f), 'utf8'))
  .join('\n')

const requiredSelectors = [
  'google-drive-embed-container',
  'google-drive-embed-poster',
  'google-drive-embed-dialog',
  'google-drive-dialog-content',
  'google-drive-dialog-close',
  'gdrive-toolbar-cover',
]

for (const sel of requiredSelectors) {
  if (!cssBundle.includes(sel)) {
    errors.push(`Missing CSS selector in bundle: .${sel}`)
  }
}

const jsFiles = readdirSync(distAssets).filter((f) => f.endsWith('.js'))
const jsBundle = jsFiles
  .map((f) => readFileSync(join(distAssets, f), 'utf8'))
  .join('\n')

if (!jsBundle.includes('google-drive-embed-poster') && !jsBundle.includes('watchLesson')) {
  errors.push('JS bundle may not include GoogleDrivePlayer wide-mode code')
}

if (errors.length) {
  console.error('Drive player verification FAILED:')
  errors.forEach((e) => console.error(' -', e))
  process.exit(1)
}

console.log('Drive player verification OK')
console.log(`  CSS files: ${cssFiles.length}`)
console.log(`  Required embed selectors present`)
