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
import { ref } from 'vue'

const ipAddress = ref('')
const loading = ref(false)
const error = ref('')
const locationData = ref(null)

const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/

const getCurrentIP = async () => {
  try {
    loading.value = true
    error.value = ''

    const response = await fetch('https://api.ipify.org?format=json')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    ipAddress.value = data.ip
    await searchLocation()
  } catch (err) {
    error.value = `获取当前IP失败：${err.message}`
  } finally {
    loading.value = false
  }
}

const searchLocation = async () => {
  if (!ipAddress.value) {
    error.value = '请输入IP地址'
    return
  }

  if (!ipRegex.test(ipAddress.value)) {
    error.value = '请输入有效的IP地址'
    return
  }

  try {
    loading.value = true
    error.value = ''

    const response = await fetch(`https://ipinfo.io/${ipAddress.value}/json`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    const data = await response.json()
    if (data.error) {
      throw new Error(data.error)
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
    }
  } catch (err) {
    error.value = `查询失败：${err.message}`
    locationData.value = null
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.ip-location {
  padding: 20px;
  max-width: 840px;
  margin: 0 auto;
}

.location-section {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  padding: 20px;
  border-radius: 10px;
}

.input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.ip-input {
  display: flex;
  gap: 10px;
}

.ip-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
}

.primary-button,
.secondary-button {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
}

.primary-button {
  background: var(--primary-color);
}

.secondary-button {
  background: #6b7280;
}

.primary-button:hover {
  background: var(--primary-color-dark);
}

.secondary-button:hover {
  background: #4b5563;
}

.loading {
  text-align: center;
  padding: 16px;
  color: var(--text-secondary);
}

.error-message {
  padding: 12px;
  background: #fdecec;
  color: #b42318;
  border-radius: 8px;
  margin-bottom: 16px;
}

.location-result {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  padding: 16px;
  border-radius: 8px;
}

.result-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.label {
  font-weight: 700;
  color: var(--text-secondary);
}

.value {
  color: var(--text-color);
  word-break: break-all;
}

@media (max-width: 768px) {
  .ip-input {
    flex-direction: column;
  }
}
</style>
