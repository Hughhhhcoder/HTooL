<template>
  <div class="data-processor">
    <h2>数据处理工具</h2>

    <div class="section">
      <h3>正则表达式测试器</h3>
      <input v-model="regexInput" placeholder="输入正则表达式" />
      <textarea v-model="textInput" placeholder="输入文本"></textarea>
      <button @click="testRegex">测试</button>
      <p v-if="regexResult !== null">匹配结果: {{ regexResult }}</p>
    </div>

    <div class="section">
      <h3>URL 编码 / 解码</h3>
      <textarea v-model="urlInput" placeholder="输入文本"></textarea>
      <button @click="encodeUrl">编码</button>
      <button @click="decodeUrl">解码</button>
      <p>结果: {{ urlResult }}</p>
    </div>

    <div class="section">
      <h3>Base64 编码 / 解码</h3>
      <textarea v-model="base64Input" placeholder="输入文本"></textarea>
      <button @click="encodeBase64">编码</button>
      <button @click="decodeBase64">解码</button>
      <p>结果: {{ base64Result }}</p>
    </div>

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
.data-processor {
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
textarea {
  width: 100%;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
}

textarea {
  min-height: 90px;
  resize: vertical;
}

button {
  margin-right: 10px;
  margin-bottom: 8px;
  padding: 10px 16px;
  background: var(--primary-color);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: var(--primary-color-dark);
}
</style>
