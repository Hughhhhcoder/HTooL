<template>
  <section class="page data-processor-page">
    <header class="page-header">
      <div>
        <p class="page-kicker">System & Data</p>
        <h1 class="page-title">数据处理工具</h1>
        <p class="page-subtitle">正则、编码和哈希计算集中在同一工作面板，减少上下切换。</p>
      </div>
    </header>

    <div class="section-grid">
      <section class="panel section-card">
        <h2 class="section-title">正则表达式测试器</h2>
        <p class="section-description">输入表达式与文本后立即返回匹配结果。</p>
        <div class="stack">
          <input v-model="regexInput" placeholder="例如：^\d{4}-\d{2}-\d{2}$" />
          <textarea v-model="textInput" placeholder="输入待测试文本"></textarea>
          <button class="btn btn-primary" @click="testRegex">执行测试</button>
          <p v-if="regexResult !== null" class="status">匹配结果：{{ regexResult }}</p>
        </div>
      </section>

      <section class="panel section-card">
        <h2 class="section-title">URL 编码 / 解码</h2>
        <p class="section-description">适合查询参数、路径片段和 URL 安全字符处理。</p>
        <div class="stack">
          <textarea v-model="urlInput" placeholder="输入文本"></textarea>
          <div class="action-row">
            <button class="btn btn-primary" @click="encodeUrl">编码</button>
            <button class="btn" @click="decodeUrl">解码</button>
          </div>
          <p class="status mono">{{ urlResult || '结果将在这里显示' }}</p>
        </div>
      </section>

      <section class="panel section-card">
        <h2 class="section-title">Base64 编码 / 解码</h2>
        <p class="section-description">文本 Base64 互转，适合接口调试与数据验证。</p>
        <div class="stack">
          <textarea v-model="base64Input" placeholder="输入文本"></textarea>
          <div class="action-row">
            <button class="btn btn-primary" @click="encodeBase64">编码</button>
            <button class="btn" @click="decodeBase64">解码</button>
          </div>
          <p class="status mono">{{ base64Result || '结果将在这里显示' }}</p>
        </div>
      </section>

      <section class="panel section-card">
        <h2 class="section-title">哈希计算</h2>
        <p class="section-description">同一输入同时生成 MD5 与 SHA256，便于快速比对。</p>
        <div class="stack">
          <textarea v-model="hashInput" placeholder="输入文本"></textarea>
          <div class="action-row">
            <button class="btn" @click="calculateMD5">计算 MD5</button>
            <button class="btn btn-primary" @click="calculateSHA256">计算 SHA256</button>
          </div>
          <p class="status mono">MD5：{{ md5Result || '-' }}</p>
          <p class="status mono">SHA256：{{ sha256Result || '-' }}</p>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import md5 from 'crypto-js/md5'
import sha256 from 'crypto-js/sha256'

const regexInput = ref('')
const textInput = ref('')
const regexResult = ref(null)

const urlInput = ref('')
const urlResult = ref('')

const base64Input = ref('')
const base64Result = ref('')

const hashInput = ref('')
const md5Result = ref('')
const sha256Result = ref('')

const testRegex = () => {
  try {
    const regex = new RegExp(regexInput.value)
    regexResult.value = regex.test(textInput.value)
  } catch {
    regexResult.value = '无效的正则表达式'
  }
}

const encodeUrl = () => {
  urlResult.value = encodeURIComponent(urlInput.value)
}

const decodeUrl = () => {
  try {
    urlResult.value = decodeURIComponent(urlInput.value)
  } catch {
    urlResult.value = '无效的 URL 编码字符串'
  }
}

const encodeBase64 = () => {
  base64Result.value = btoa(base64Input.value)
}

const decodeBase64 = () => {
  try {
    base64Result.value = atob(base64Input.value)
  } catch {
    base64Result.value = '无效的 Base64 字符串'
  }
}

const calculateMD5 = () => {
  md5Result.value = md5(hashInput.value).toString()
}

const calculateSHA256 = () => {
  sha256Result.value = sha256(hashInput.value).toString()
}
</script>

<style scoped>
.data-processor-page {
  display: flex;
  flex-direction: column;
}

.section-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.section-card {
  padding: var(--space-6);
}

.stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 16px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 980px) {
  .section-grid {
    grid-template-columns: 1fr;
  }

  .section-card {
    padding: var(--space-4);
  }
}
</style>
