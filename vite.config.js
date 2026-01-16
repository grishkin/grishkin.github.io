import { resolve } from 'path'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

// Find all HTML files in a directory
function getHtmlFiles(dir, prefix = '') {
  const entries = {}
  if (!fs.existsSync(dir)) return entries
  
  const items = fs.readdirSync(dir)
  items.forEach(item => {
    const itemPath = path.join(dir, item)
    if (fs.statSync(itemPath).isDirectory()) {
      const indexFile = path.join(itemPath, 'index.html')
      if (fs.existsSync(indexFile)) {
        const key = prefix ? `${prefix}/${item}` : item
        entries[key] = indexFile
      }
    } else if (item.endsWith('.html')) {
      const key = prefix ? `${prefix}/${item.replace('.html', '')}` : item.replace('.html', '')
      entries[key] = itemPath
    }
  })
  return entries
}

// Plugin to watch markdown files and rebuild posts
function markdownHotReload() {
  return {
    name: 'markdown-hot-reload',
    configureServer(server) {
      server.watcher.add('src/posts/**/*.md')
      server.watcher.on('change', (file) => {
        if (file.endsWith('.md')) {
          console.log(`\n📝 Markdown changed: ${path.basename(file)}`)
          execSync('npm run posts', { stdio: 'inherit' })
          server.ws.send({ type: 'full-reload' })
        }
      })
    }
  }
}

export default defineConfig({
  plugins: [markdownHotReload()],
  build: {
    outDir: 'docs',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...getHtmlFiles(resolve(__dirname, 'posts'), 'posts'),
        ...getHtmlFiles(resolve(__dirname, 'demos'), 'demos')
      }
    }
  }
})
