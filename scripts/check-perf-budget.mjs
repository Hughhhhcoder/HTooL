import { readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const distAssetsDir = join(process.cwd(), 'dist', 'assets')
const entryBudget = Number(process.env.PERF_BUDGET_ENTRY_JS || 560 * 1024)
const maxChunkBudget = Number(process.env.PERF_BUDGET_MAX_CHUNK || 600 * 1024)

if (!existsSync(distAssetsDir)) {
  console.error('未找到 dist/assets。请先运行 `npm run build`。')
  process.exit(1)
}

const assetFiles = readdirSync(distAssetsDir)
const jsFiles = assetFiles
  .filter((name) => name.endsWith('.js'))
  .map((name) => ({
    name,
    size: statSync(join(distAssetsDir, name)).size
  }))
  .sort((a, b) => b.size - a.size)

if (!jsFiles.length) {
  console.error('dist/assets 中没有 JS 文件。')
  process.exit(1)
}

const entryChunk =
  jsFiles.find((file) => /^index-.*\.js$/.test(file.name)) ||
  jsFiles[jsFiles.length - 1]

const largestChunk = jsFiles[0]
const formatKB = (bytes) => `${(bytes / 1024).toFixed(2)} KB`

console.log(`Entry chunk: ${entryChunk.name} (${formatKB(entryChunk.size)})`)
console.log(`Largest chunk: ${largestChunk.name} (${formatKB(largestChunk.size)})`)
console.log(`Entry budget: ${formatKB(entryBudget)} | Max chunk budget: ${formatKB(maxChunkBudget)}`)

if (entryChunk.size > entryBudget) {
  console.error(`首入口 JS 超预算: ${formatKB(entryChunk.size)} > ${formatKB(entryBudget)}`)
  process.exit(1)
}

if (largestChunk.size > maxChunkBudget) {
  console.error(`存在超大 JS chunk: ${formatKB(largestChunk.size)} > ${formatKB(maxChunkBudget)}`)
  process.exit(1)
}

console.log('Perf budget 检查通过。')
