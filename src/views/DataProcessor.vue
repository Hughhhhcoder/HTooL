<template>
  <div class="data-processor">
    <h2>数据处理工具</h2>

    <!-- 正则表达式测试器 -->
    <div class="section">
      <h3>正则表达式测试器</h3>
      <input v-model="regexInput" placeholder="输入正则表达式" />
      <textarea v-model="textInput" placeholder="输入文本"></textarea>
      <button @click="testRegex">测试</button>
      <p v-if="regexResult !== null">匹配结果: {{ regexResult }}</p>
    </div>

    <!-- URL 编码/解码 -->
    <div class="section">
      <h3>URL 编码 / 解码</h3>
      <textarea v-model="urlInput" placeholder="输入文本"></textarea>
      <button @click="encodeUrl">编码</button>
      <button @click="decodeUrl">解码</button>
      <p>结果: {{ urlResult }}</p>
    </div>

    <!-- Base64 编码/解码 -->
    <div class="section">
      <h3>Base64 编码 / 解码</h3>
      <textarea v-model="base64Input" placeholder="输入文本"></textarea>
      <button @click="encodeBase64">编码</button>
      <button @click="decodeBase64">解码</button>
      <p>结果: {{ base64Result }}</p>
    </div>

    <!-- 哈希计算 -->
    <div class="section">
      <h3>哈希计算</h3>
      <textarea v-model="hashInput" placeholder="输入文本"></textarea>
      <button @click="calculateMD5">计算 MD5</button>
      <button @click="calculateSHA256">计算 SHA256</button>
      <p>MD5: {{ md5Result }}</p>
      <p>SHA256: {{ sha256Result }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import md5 from 'crypto-js/md5';
import sha256 from 'crypto-js/sha256';

const regexInput = ref('');
const textInput = ref('');
const regexResult = ref(null);

const urlInput = ref('');
const urlResult = ref('');

const base64Input = ref('');
const base64Result = ref('');

const hashInput = ref('');
const md5Result = ref('');
const sha256Result = ref('');

const testRegex = () => {
  try {
    const regex = new RegExp(regexInput.value);
    regexResult.value = regex.test(textInput.value);
  } catch (e) {
    regexResult.value = '无效的正则表达式';
  }
};

const encodeUrl = () => {
  urlResult.value = encodeURIComponent(urlInput.value);
};

const decodeUrl = () => {
  urlResult.value = decodeURIComponent(urlInput.value);
};

const encodeBase64 = () => {
  base64Result.value = btoa(base64Input.value);
};

const decodeBase64 = () => {
  try {
    base64Result.value = atob(base64Input.value);
  } catch (e) {
    base64Result.value = '无效的 Base64 字符串';
  }
};

const calculateMD5 = () => {
  md5Result.value = md5(hashInput.value).toString();
};

const calculateSHA256 = () => {
  sha256Result.value = sha256(hashInput.value).toString();
};
</script>

<style scoped>
.data-processor {
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

input, textarea {
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

/* 暗色模式支持 */
.dark-theme .data-container {
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

.dark-theme .result-display .data-output {
  color: #ddd;
}

.dark-theme .result-display .data-output pre {
  background: #2d2d2d;
  border-color: #444;
  color: #ddd;
}

.dark-theme .result-display .data-output code {
  background: #3a3a3a;
  color: #fff;
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

/* 暗色模式下的文件上传区域样式 */
.dark-theme .file-upload {
  background: #333;
  border-color: #444;
}

.dark-theme .file-upload:hover {
  background: #3a3a3a;
}

.dark-theme .file-upload input[type="file"] {
  color: #ddd;
}

/* 暗色模式下的数据表格样式 */
.dark-theme .data-table {
  background: #333;
  border-color: #444;
}

.dark-theme .data-table th {
  background: #3a3a3a;
  color: #fff;
  border-color: #444;
}

.dark-theme .data-table td {
  color: #ddd;
  border-color: #444;
}

.dark-theme .data-table tr:nth-child(even) {
  background: #2d2d2d;
}

.dark-theme .data-table tr:hover {
  background: #3a3a3a;
}

/* 暗色模式下的数据可视化样式 */
.dark-theme .visualization {
  background: #333;
  border-color: #444;
}

.dark-theme .visualization .chart-title {
  color: #fff;
}

.dark-theme .visualization .chart-legend {
  color: #ddd;
}

.dark-theme .visualization .chart-axis {
  color: #aaa;
}

.dark-theme .visualization .chart-grid {
  stroke: #444;
}

.dark-theme .visualization .chart-line {
  stroke: var(--primary-color);
}

.dark-theme .visualization .chart-area {
  fill: rgba(0, 123, 255, 0.1);
}

.dark-theme .visualization .chart-point {
  fill: var(--primary-color);
  stroke: #333;
}

/* 暗色模式下的数据统计样式 */
.dark-theme .stats-section {
  background: #333;
  border-color: #444;
}

.dark-theme .stats-section h4 {
  color: #fff;
  border-color: #444;
}

.dark-theme .stats-grid {
  border-color: #444;
}

.dark-theme .stat-item {
  border-color: #444;
  color: #ddd;
}

.dark-theme .stat-item .stat-label {
  color: #aaa;
}

.dark-theme .stat-item .stat-value {
  color: #fff;
}

/* 暗色模式下的导出选项样式 */
.dark-theme .export-options {
  background: #333;
  border-color: #444;
}

.dark-theme .export-options h4 {
  color: #fff;
}

.dark-theme .export-options select {
  background: #2d2d2d;
  border-color: #444;
  color: #ddd;
}

.dark-theme .export-options select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.dark-theme .export-options button {
  background: #3a3a3a;
  border-color: #444;
  color: #ddd;
}

.dark-theme .export-options button:hover {
  background: #444;
  color: #fff;
}

.dark-theme .export-options button:active {
  background: #333;
}
</style> 