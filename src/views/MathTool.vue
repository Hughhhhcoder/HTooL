<template>
  <div class="math-tool">
    <h2>数学小工具</h2>

    <div class="section">
      <h3>单位换算</h3>
      <select v-model="unitType">
        <option value="length">长度</option>
        <option value="mass">质量</option>
        <option value="volume">体积</option>
      </select>
      <input v-model.number="unitInput" placeholder="输入数值" type="number" />
      <select v-model="fromUnit">
        <option v-for="unit in units[unitType]" :key="unit" :value="unit">{{ unit }}</option>
      </select>
      <select v-model="toUnit">
        <option v-for="unit in units[unitType]" :key="unit" :value="unit">{{ unit }}</option>
      </select>
      <button @click="convertUnit">转换</button>
      <p>结果: {{ unitResult }}</p>
    </div>

    <div class="section">
      <h3>数学公式渲染</h3>
      <textarea v-model="formulaInput" placeholder="输入 LaTeX 公式"></textarea>
      <div v-html="renderedFormula" class="formula"></div>
    </div>

    <div class="section">
      <h3>简单统计计算</h3>
      <textarea v-model="statsInput" placeholder="输入数据，用逗号分隔"></textarea>
      <button @click="calculateStats">计算</button>
      <p>均值: {{ mean }}</p>
      <p>标准差: {{ standardDeviation }}</p>
    </div>

    <div class="section">
      <h3>矩阵计算</h3>
      <textarea v-model="matrixInput" placeholder="输入矩阵数据，用分号分隔行"></textarea>
      <button @click="calculateMatrix">计算行列式</button>
      <p>行列式: {{ determinant }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { parseMatrixInput, parseNumericList } from '../utils/mathTool'

const unitType = ref('length')
const unitInput = ref(0)
const fromUnit = ref('m')
const toUnit = ref('cm')
const unitResult = ref('')

const units = {
  length: ['m', 'cm', 'mm', 'km'],
  mass: ['kg', 'g', 'mg', 'lb'],
  volume: ['l', 'ml', 'm3', 'cm3']
}

const formulaInput = ref('')
const renderedFormula = ref('')

const statsInput = ref('')
const mean = ref('')
const standardDeviation = ref('')

const matrixInput = ref('')
const determinant = ref('')

let katexLib = null
let katexCssLoaded = false

const ensureKatex = async () => {
  if (!katexCssLoaded) {
    await import('katex/dist/katex.min.css')
    katexCssLoaded = true
  }

  if (katexLib) return katexLib
  const katexModule = await import('katex')
  katexLib = katexModule.default
  return katexLib
}

const unitFactorMap = {
  length: { m: 1, cm: 0.01, mm: 0.001, km: 1000 },
  mass: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.45359237 },
  volume: { l: 1, ml: 0.001, m3: 1000, cm3: 0.001 }
}

const calculateMean = (values) => {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

const calculateStdDev = (values, meanValue) => {
  const variance =
    values.reduce((sum, value) => sum + (value - meanValue) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

const calculateDeterminant = (matrix) => {
  const size = matrix.length
  if (!size || matrix.some((row) => row.length !== size)) {
    throw new Error('matrix must be square')
  }

  if (size === 1) return matrix[0][0]
  if (size === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]

  return matrix[0].reduce((acc, value, column) => {
    const subMatrix = matrix
      .slice(1)
      .map((row) => row.filter((_, columnIndex) => columnIndex !== column))
    const sign = column % 2 === 0 ? 1 : -1
    return acc + sign * value * calculateDeterminant(subMatrix)
  }, 0)
}

const convertUnit = () => {
  try {
    const factors = unitFactorMap[unitType.value]
    const fromFactor = factors[fromUnit.value]
    const toFactor = factors[toUnit.value]
    if (!fromFactor || !toFactor) {
      throw new Error('unit not supported')
    }
    const result = (unitInput.value * fromFactor) / toFactor
    unitResult.value = `${result} ${toUnit.value}`
  } catch (error) {
    unitResult.value = '转换错误'
  }
}

const calculateStats = () => {
  try {
    const data = parseNumericList(statsInput.value)
    const meanValue = calculateMean(data)
    mean.value = String(meanValue)
    standardDeviation.value = String(calculateStdDev(data, meanValue))
  } catch (error) {
    mean.value = '计算错误'
    standardDeviation.value = '计算错误'
  }
}

const calculateMatrix = () => {
  try {
    const matrix = parseMatrixInput(matrixInput.value)
    determinant.value = String(calculateDeterminant(matrix))
  } catch (error) {
    determinant.value = '计算错误'
  }
}

watch(unitType, (type) => {
  const [defaultFrom, defaultTo] = units[type]
  fromUnit.value = defaultFrom
  toUnit.value = defaultTo || defaultFrom
  unitResult.value = ''
})

watch(formulaInput, async (formula) => {
  if (!formula.trim()) {
    renderedFormula.value = ''
    return
  }

  try {
    const katex = await ensureKatex()
    renderedFormula.value = katex.renderToString(formula, { throwOnError: false })
  } catch (error) {
    renderedFormula.value = '渲染错误'
  }
})
</script>

<style scoped>
.math-tool {
  padding: 20px;
  max-width: 820px;
  margin: 0 auto;
}

.section {
  margin-bottom: 20px;
  padding: 20px;
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

input,
textarea,
select {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
}

button {
  margin-right: 10px;
  padding: 10px 20px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: var(--primary-color-dark);
}

.formula {
  margin-top: 10px;
  min-height: 52px;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  overflow-x: auto;
}

.formula :deep(.katex) {
  color: var(--text-color);
}
</style>
