import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname } from 'node:path'

const rootDir = join(process.cwd(), 'src')
const gradientPattern = /\b(?:linear|radial|conic)-gradient\s*\(/i

const collectedFiles = []

const walk = (dir) => {
  const entries = readdirSync(dir)
  entries.forEach((entry) => {
    const filePath = join(dir, entry)
    const fileStat = statSync(filePath)
    if (fileStat.isDirectory()) {
      walk(filePath)
      return
    }

    const extension = extname(filePath)
    if (extension === '.css' || extension === '.vue') {
      collectedFiles.push(filePath)
    }
  })
}

const extractStyleBlocks = (source) => {
  const blocks = []
  const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi
  let match = styleRegex.exec(source)

  while (match) {
    blocks.push(match[1])
    match = styleRegex.exec(source)
  }

  return blocks
}

const findMatchesWithLine = (source) => {
  const lines = source.split('\n')
  const results = []

  lines.forEach((line, index) => {
    if (gradientPattern.test(line)) {
      results.push({
        line: index + 1,
        text: line.trim()
      })
    }
  })

  return results
}

walk(rootDir)

const violations = []

collectedFiles.forEach((filePath) => {
  const source = readFileSync(filePath, 'utf8')
  const extension = extname(filePath)

  if (extension === '.css') {
    const matches = findMatchesWithLine(source)
    matches.forEach((match) => {
      violations.push({ filePath, ...match })
    })
    return
  }

  const styleBlocks = extractStyleBlocks(source)
  styleBlocks.forEach((block) => {
    const matches = findMatchesWithLine(block)
    matches.forEach((match) => {
      violations.push({ filePath, ...match })
    })
  })
})

if (violations.length) {
  console.error('检测到禁用样式：项目不允许使用 CSS gradient。')
  violations.forEach((item) => {
    console.error(`- ${item.filePath}:${item.line} -> ${item.text}`)
  })
  process.exit(1)
}

console.log('No-gradient 检查通过。')
