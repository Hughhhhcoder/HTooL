<template>
  <div class="math-tool">
    <h2>数学小工具</h2>

    <!-- 单位换算 -->
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

    <!-- 数学公式渲染 -->
    <div class="section">
      <h3>数学公式渲染</h3>
      <textarea v-model="formulaInput" placeholder="输入 LaTeX 公式"></textarea>
      <div v-html="renderedFormula" class="formula"></div>
    </div>

    <!-- 简单统计计算 -->
    <div class="section">
      <h3>简单统计计算</h3>
      <textarea v-model="statsInput" placeholder="输入数据，用逗号分隔"></textarea>
      <button @click="calculateStats">计算</button>
      <p>均值: {{ mean }}</p>
      <p>标准差: {{ standardDeviation }}</p>
    </div>

    <!-- 矩阵计算 -->
    <div class="section">
      <h3>矩阵计算</h3>
      <textarea v-model="matrixInput" placeholder="输入矩阵数据，用分号分隔行"></textarea>
      <button @click="calculateMatrix">计算行列式</button>
      <p>行列式: {{ determinant }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import katex from 'katex';
import * as math from 'mathjs';

const unitType = ref('length');
const unitInput = ref(0);
const fromUnit = ref('m');
const toUnit = ref('cm');
const unitResult = ref('');

const units = {
  length: ['m', 'cm', 'mm', 'km'],
  mass: ['kg', 'g', 'mg', 'lb'],
  volume: ['l', 'ml', 'm3', 'cm3']
};

const convertUnit = () => {
  try {
    const result = math.unit(unitInput.value, fromUnit.value).toNumber(toUnit.value);
    unitResult.value = result + ' ' + toUnit.value;
  } catch (error) {
    unitResult.value = '转换错误';
  }
};

const formulaInput = ref('');
const renderedFormula = computed(() => {
  try {
    return katex.renderToString(formulaInput.value, { throwOnError: false });
  } catch (error) {
    return '渲染错误';
  }
});

const statsInput = ref('');
const mean = ref(0);
const standardDeviation = ref(0);

const calculateStats = () => {
  try {
    const data = statsInput.value.split(',').map(Number);
    mean.value = math.mean(data);
    standardDeviation.value = math.std(data);
  } catch (error) {
    mean.value = '计算错误';
    standardDeviation.value = '计算错误';
  }
};

const matrixInput = ref('');
const determinant = ref('');

const calculateMatrix = () => {
  try {
    const matrix = math.matrix(matrixInput.value.split(';').map(row => row.split(',').map(Number)));
    determinant.value = math.det(matrix);
  } catch (error) {
    determinant.value = '计算错误';
  }
};
</script>

<style scoped>
.math-tool {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section {
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

input, textarea, select {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  margin-right: 10px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}

.formula {
  margin-top: 10px;
  padding: 10px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 暗色模式支持 */
.dark-theme .math-container {
  background: #2d2d2d;
  border-color: #444;
}

.dark-theme .input-section,
.dark-theme .output-section {
  background: #333;
  border-color: #444;
}

.dark-theme .input-section h3,
.dark-theme .output-section h3 {
  color: #fff;
  border-color: #444;
}

.dark-theme .input-section textarea {
  background: #2d2d2d;
  border-color: #444;
  color: #ddd;
}

.dark-theme .input-section textarea::placeholder {
  color: #666;
}

.dark-theme .input-section textarea:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.dark-theme .action-buttons button {
  background: #3a3a3a;
  border-color: #444;
  color: #ddd;
}

.dark-theme .action-buttons button:hover {
  background: #444;
  color: #fff;
}

.dark-theme .action-buttons button:active {
  background: #333;
}

.dark-theme .result-display {
  background: #333;
  border-color: #444;
}

.dark-theme .result-display .placeholder {
  color: #666;
}

.dark-theme .result-display .placeholder i {
  color: #444;
}

.dark-theme .result-display .math-output {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .base {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mbin {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mrel {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mopen {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mclose {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mpunct {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mtext {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mspace {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .msupsub {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mfrac {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mroot {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .msqrt {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mstyle {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.text {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.mathit {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.mathnormal {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.boldsymbol {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.bold {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.amsrm {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.amsbb {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.amsfonts {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.amssymb {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stmaryrd {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-general {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-symbols {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-math {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathbb {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathcal {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathfrak {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathscr {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathsf {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathtt {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathit {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathnormal {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathbf {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathbbf {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathcalbf {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathfrakbf {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathscrbf {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathsfbf {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathttbf {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathitbf {
  color: #ddd;
}

.dark-theme .result-display .math-output .katex .mord.stix-mathnormalbf {
  color: #ddd;
}

.dark-theme .mobile-nav {
  background: #333;
  border-color: #444;
}

.dark-theme .mobile-nav button {
  color: #ddd;
}

.dark-theme .mobile-nav button:hover {
  color: #fff;
}

/* 暗色模式下的错误提示样式 */
.dark-theme .error-message {
  background: #3a3a3a;
  border-color: #dc3545;
  color: #ff6b6b;
}

/* 暗色模式下的成功提示样式 */
.dark-theme .success-message {
  background: #3a3a3a;
  border-color: #28a745;
  color: #6cff6c;
}

/* 暗色模式下的加载动画样式 */
.dark-theme .loading-spinner {
  border-color: #444;
  border-top-color: var(--primary-color);
}

/* 暗色模式下的工具提示样式 */
.dark-theme .tooltip {
  background: #333;
  color: #ddd;
  border-color: #444;
}

.dark-theme .tooltip::before {
  border-color: #444 transparent transparent transparent;
}

/* 暗色模式下的模态框样式 */
.dark-theme .modal {
  background: #333;
  border-color: #444;
}

.dark-theme .modal-header {
  border-color: #444;
}

.dark-theme .modal-title {
  color: #fff;
}

.dark-theme .modal-body {
  color: #ddd;
}

.dark-theme .modal-footer {
  border-color: #444;
}

/* 暗色模式下的标签页样式 */
.dark-theme .tabs {
  border-color: #444;
}

.dark-theme .tab {
  color: #ddd;
  border-color: #444;
}

.dark-theme .tab.active {
  background: #3a3a3a;
  color: #fff;
  border-color: var(--primary-color);
}

.dark-theme .tab:hover {
  background: #444;
}
</style> 