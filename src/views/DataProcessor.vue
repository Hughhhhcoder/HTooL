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
</style> 