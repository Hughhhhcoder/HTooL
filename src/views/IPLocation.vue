<template>
  <div class="ip-location">
    <h2>IP 地址定位</h2>
    
    <div class="location-section">
      <div class="input-section">
        <div class="ip-input">
          <input 
            type="text" 
            v-model="ipAddress" 
            placeholder="输入IP地址，例如：8.8.8.8"
          />
          <button @click="getCurrentIP" class="secondary-button">获取当前IP</button>
        </div>
        <button @click="searchLocation" class="primary-button">查询位置</button>
      </div>

      <div v-if="loading" class="loading">
        <p>正在查询中...</p>
      </div>

      <div v-if="error" class="error-message">
        <p>{{ error }}</p>
      </div>

      <div v-if="locationData" class="location-result">
        <h3>查询结果</h3>
        <div class="result-grid">
          <div class="result-item">
            <span class="label">IP地址：</span>
            <span class="value">{{ locationData.ip }}</span>
          </div>
          <div class="result-item">
            <span class="label">国家：</span>
            <span class="value">{{ locationData.country }}</span>
          </div>
          <div class="result-item">
            <span class="label">地区：</span>
            <span class="value">{{ locationData.region }}</span>
          </div>
          <div class="result-item">
            <span class="label">城市：</span>
            <span class="value">{{ locationData.city }}</span>
          </div>
          <div class="result-item">
            <span class="label">邮政编码：</span>
            <span class="value">{{ locationData.postal }}</span>
          </div>
          <div class="result-item">
            <span class="label">经纬度：</span>
            <span class="value">{{ locationData.loc }}</span>
          </div>
          <div class="result-item">
            <span class="label">时区：</span>
            <span class="value">{{ locationData.timezone }}</span>
          </div>
          <div class="result-item">
            <span class="label">运营商：</span>
            <span class="value">{{ locationData.org }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const ipAddress = ref('');
const loading = ref(false);
const error = ref('');
const locationData = ref(null);

// 获取当前IP
const getCurrentIP = async () => {
  try {
    loading.value = true;
    error.value = '';
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    ipAddress.value = data.ip;
    await searchLocation();
  } catch (err) {
    error.value = '获取当前IP失败：' + err.message;
  } finally {
    loading.value = false;
  }
};

// 查询位置
const searchLocation = async () => {
  if (!ipAddress.value) {
    error.value = '请输入IP地址';
    return;
  }

  // 验证IP地址格式
  const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  if (!ipRegex.test(ipAddress.value)) {
    error.value = '请输入有效的IP地址';
    return;
  }

  try {
    loading.value = true;
    error.value = '';
    const response = await fetch(`https://ipinfo.io/${ipAddress.value}/json`);
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    locationData.value = {
      ip: data.ip,
      country: data.country,
      region: data.region,
      city: data.city,
      postal: data.postal,
      loc: data.loc,
      timezone: data.timezone,
      org: data.org
    };
  } catch (err) {
    error.value = '查询失败：' + err.message;
    locationData.value = null;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.ip-location {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.location-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.ip-input {
  display: flex;
  gap: 10px;
}

.ip-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.primary-button {
  background: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.secondary-button {
  background: #6c757d;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.primary-button:hover {
  background: #0056b3;
}

.secondary-button:hover {
  background: #5a6268;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.error-message {
  padding: 15px;
  background: #f8d7da;
  color: #721c24;
  border-radius: 4px;
  margin-bottom: 20px;
}

.location-result {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.label {
  font-weight: bold;
  color: #666;
}

.value {
  color: #333;
  word-break: break-all;
}

/* 暗色模式支持 */
.dark-theme .ip-container {
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

.dark-theme .input-section input {
  background: #2d2d2d;
  border-color: #444;
  color: #ddd;
}

.dark-theme .input-section input::placeholder {
  color: #666;
}

.dark-theme .input-section input:focus {
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

.dark-theme .result-display .ip-info {
  color: #ddd;
}

.dark-theme .result-display .ip-info .info-item {
  border-color: #444;
}

.dark-theme .result-display .ip-info .info-label {
  color: #aaa;
}

.dark-theme .result-display .ip-info .info-value {
  color: #fff;
}

.dark-theme .result-display .map-container {
  background: #333;
  border-color: #444;
}

.dark-theme .result-display .map-container iframe {
  border-color: #444;
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

/* 暗色模式下的地图样式 */
.dark-theme .map-container {
  background: #333;
}

.dark-theme .map-container .map-controls {
  background: #333;
  border-color: #444;
}

.dark-theme .map-container .map-controls button {
  background: #3a3a3a;
  border-color: #444;
  color: #ddd;
}

.dark-theme .map-container .map-controls button:hover {
  background: #444;
  color: #fff;
}

.dark-theme .map-container .map-controls button:active {
  background: #333;
}

.dark-theme .map-container .map-legend {
  background: #333;
  border-color: #444;
  color: #ddd;
}

.dark-theme .map-container .map-legend .legend-item {
  border-color: #444;
}

.dark-theme .map-container .map-legend .legend-color {
  border-color: #444;
}

.dark-theme .map-container .map-legend .legend-label {
  color: #ddd;
}

/* 暗色模式下的历史记录样式 */
.dark-theme .history-section {
  background: #333;
  border-color: #444;
}

.dark-theme .history-section h4 {
  color: #fff;
  border-color: #444;
}

.dark-theme .history-list {
  border-color: #444;
}

.dark-theme .history-item {
  border-color: #444;
  color: #ddd;
}

.dark-theme .history-item:hover {
  background: #3a3a3a;
}

.dark-theme .history-item .history-ip {
  color: #fff;
}

.dark-theme .history-item .history-time {
  color: #aaa;
}

.dark-theme .history-item .history-actions {
  color: #aaa;
}

.dark-theme .history-item:hover .history-actions {
  color: #fff;
}

/* 暗色模式下的统计信息样式 */
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

/* 暗色模式下的图表样式 */
.dark-theme .chart-container {
  background: #333;
  border-color: #444;
}

.dark-theme .chart-container .chart-title {
  color: #fff;
}

.dark-theme .chart-container .chart-legend {
  color: #ddd;
}

.dark-theme .chart-container .chart-axis {
  color: #aaa;
}

.dark-theme .chart-container .chart-grid {
  stroke: #444;
}

.dark-theme .chart-container .chart-line {
  stroke: var(--primary-color);
}

.dark-theme .chart-container .chart-area {
  fill: rgba(0, 123, 255, 0.1);
}

.dark-theme .chart-container .chart-point {
  fill: var(--primary-color);
  stroke: #333;
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