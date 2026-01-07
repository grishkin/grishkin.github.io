import { resolve } from 'path'
import { defineConfig } from 'vite'
import fs from 'fs'
import path from 'path'

// Helper to find all index.html files in demos directory
function getDemoEntryPoints() {
  const demosDir = resolve(__dirname, 'demos')
  const entries = {}

  if (fs.existsSync(demosDir)) {
    const demos = fs.readdirSync(demosDir)
    demos.forEach(demo => {
      const demoPath = path.join(demosDir, demo)
      if (fs.statSync(demoPath).isDirectory()) {
        const indexFile = path.join(demoPath, 'index.html')
        if (fs.existsSync(indexFile)) {
          entries[demo] = indexFile
        }
      }
    })
  }
  return entries
}

export default defineConfig({
  build: {
    outDir: 'docs',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        graph: resolve(__dirname, 'graph.html'),
        heaps: resolve(__dirname, 'heaps.html'),
        interviewing_users: resolve(__dirname, 'interviewing-users.html'),
        ...getDemoEntryPoints()
      }
    }
  }
})
