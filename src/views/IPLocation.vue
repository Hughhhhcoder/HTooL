<template>
  <section class="page ip-page">
    <header class="page-header">
      <div>
        <p class="page-kicker">System & Data</p>
        <h1 class="page-title">IP 地址定位</h1>
        <p class="page-subtitle">输入任意 IPv4 地址，快速获得地域、时区和运营商信息。</p>
      </div>
    </header>

    <section class="panel query-panel">
      <div class="query-row">
        <input
          type="text"
          v-model="ipAddress"
          placeholder="输入 IP 地址，例如：8.8.8.8"
        />
        <button class="btn" @click="getCurrentIP">获取当前 IP</button>
        <button class="btn btn-primary" @click="searchLocation">查询位置</button>
      </div>

      <p v-if="loading" class="status">正在查询中...</p>
      <p v-if="error" class="status status-error">{{ error }}</p>

      <div v-if="locationData" class="result panel panel-muted">
        <h2 class="section-title">查询结果</h2>
        <div class="result-grid">
          <div class="result-item">
            <span class="label">IP 地址</span>
            <span class="value mono">{{ locationData.ip }}</span>
          </div>
          <div class="result-item">
            <span class="label">国家</span>
            <span class="value">{{ locationData.country || '-' }}</span>
          </div>
          <div class="result-item">
            <span class="label">地区</span>
            <span class="value">{{ locationData.region || '-' }}</span>
          </div>
          <div class="result-item">
            <span class="label">城市</span>
            <span class="value">{{ locationData.city || '-' }}</span>
          </div>
          <div class="result-item">
            <span class="label">邮政编码</span>
            <span class="value">{{ locationData.postal || '-' }}</span>
          </div>
          <div class="result-item">
            <span class="label">经纬度</span>
            <span class="value mono">{{ locationData.loc || '-' }}</span>
          </div>
          <div class="result-item">
            <span class="label">时区</span>
            <span class="value">{{ locationData.timezone || '-' }}</span>
          </div>
          <div class="result-item">
            <span class="label">运营商</span>
            <span class="value">{{ locationData.org || '-' }}</span>
          </div>
        </div>
      </div>
    </section>
  </section>
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
.ip-page {
  display: flex;
  flex-direction: column;
}

.query-panel {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.query-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
}

.result {
  padding: var(--space-5);
}

.result-grid {
  margin-top: 14px;
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
}

.result-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.label {
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.value {
  color: var(--text-primary);
  word-break: break-all;
}

@media (max-width: 860px) {
  .query-panel {
    padding: var(--space-4);
  }

  .query-row {
    grid-template-columns: 1fr;
  }
}
</style>
