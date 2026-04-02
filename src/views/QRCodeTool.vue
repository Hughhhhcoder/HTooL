<template>
  <div class="qr-code-tool">
    <h2>二维码生成 / 解析</h2>

    <div class="generate-section">
      <h3>生成二维码</h3>
      <div class="input-type-selector">
        <button
          v-for="type in inputTypes"
          :key="type.value"
          :class="{ active: currentInputType === type.value }"
          @click="currentInputType = type.value"
        >
          {{ type.label }}
        </button>
      </div>

      <textarea
        v-if="currentInputType === 'text'"
        v-model="textInput"
        placeholder="输入文本生成二维码"
      ></textarea>

      <input
        v-if="currentInputType === 'url'"
        type="url"
        v-model="urlInput"
        placeholder="输入链接生成二维码"
      />

      <div class="style-settings">
        <div class="setting-item">
          <label>二维码尺寸:</label>
          <input type="number" v-model.number="qrSize" min="200" max="800" step="50" />
          <span>像素</span>
        </div>
        <div class="setting-item">
          <label>前景色:</label>
          <input type="color" v-model="darkColor" />
        </div>
        <div class="setting-item">
          <label>背景色:</label>
          <input type="color" v-model="lightColor" />
        </div>
        <div class="setting-item">
          <label>边距:</label>
          <input type="number" v-model.number="margin" min="0" max="4" step="1" />
        </div>
      </div>

      <button @click="generateQRCode" class="primary-button" :disabled="isGenerating">
        {{ isGenerating ? '生成中...' : '生成二维码' }}
      </button>

      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>

      <div v-if="qrCodeDataUrl" class="qr-result">
        <img :src="qrCodeDataUrl" alt="生成的二维码" />
        <div class="qr-actions">
          <button @click="downloadQRCode">下载二维码</button>
        </div>
      </div>
    </div>

    <div class="decode-section">
      <h3>解析二维码</h3>
      <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
        <input type="file" @change="handleFileSelect" accept="image/*" ref="fileInput" />
        <p>点击上传或拖拽图片到此处</p>
      </div>

      <div v-if="decodedResult" class="decode-result">
        <h4>解析结果:</h4>
        <div class="result-content">
          <p>{{ decodedResult.text }}</p>
          <p v-if="decodedResult.type">类型: {{ decodedResult.type }}</p>
          <a v-if="isValidUrl(decodedResult.text)" :href="decodedResult.text" target="_blank" rel="noopener noreferrer">打开链接</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { detectQrContentType, isValidUrl } from '../utils/qr'

const currentInputType = ref('text')
const textInput = ref('')
const urlInput = ref('')
const qrCodeDataUrl = ref('')
const decodedResult = ref(null)
const fileInput = ref(null)
const isGenerating = ref(false)
const errorMessage = ref('')

const qrSize = ref(400)
const darkColor = ref('#000000')
const lightColor = ref('#FFFFFF')
const margin = ref(2)

const inputTypes = [
  { label: '文本', value: 'text' },
  { label: '链接', value: 'url' }
]

let QRCodeLib = null
let jsQRLib = null

const ensureQRCodeDeps = async () => {
  if (QRCodeLib && jsQRLib) {
    return { QRCode: QRCodeLib, jsQR: jsQRLib }
  }

  const [qrModule, jsqrModule] = await Promise.all([
    import('qrcode'),
    import('jsqr')
  ])

  QRCodeLib = qrModule.default
  jsQRLib = jsqrModule.default

  return { QRCode: QRCodeLib, jsQR: jsQRLib }
}

const generateQRCode = async () => {
  errorMessage.value = ''

  const content = currentInputType.value === 'url' ? urlInput.value.trim() : textInput.value.trim()
  if (!content) {
    errorMessage.value = '请输入内容'
    return
  }

  try {
    isGenerating.value = true
    const { QRCode } = await ensureQRCodeDeps()
    qrCodeDataUrl.value = await QRCode.toDataURL(content, {
      width: qrSize.value,
      margin: margin.value,
      color: {
        dark: darkColor.value,
        light: lightColor.value
      },
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 1
    })
  } catch (error) {
    errorMessage.value = `二维码生成失败: ${error.message}`
  } finally {
    isGenerating.value = false
  }
}

const downloadQRCode = () => {
  if (!qrCodeDataUrl.value) return

  const link = document.createElement('a')
  link.download = 'qrcode.png'
  link.href = qrCodeDataUrl.value
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const decodeQRCodeFile = async (file) => {
  errorMessage.value = ''

  try {
    const { jsQR } = await ensureQRCodeDeps()
    const dataURL = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(file)
    })

    const img = await new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('图片加载失败'))
      image.src = dataURL
    })

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    context.drawImage(img, 0, 0, img.width, img.height)

    const imageData = context.getImageData(0, 0, img.width, img.height)
    const code = jsQR(imageData.data, img.width, img.height)

    if (!code) {
      throw new Error('二维码解析失败')
    }

    decodedResult.value = {
      text: code.data,
      type: detectQrContentType(code.data)
    }
  } catch (error) {
    decodedResult.value = null
    errorMessage.value = error.message || '二维码解析失败'
  }
}

const handleDrop = (event) => {
  const file = event.dataTransfer.files[0]
  if (file && file.type.startsWith('image/')) {
    decodeQRCodeFile(file)
  }
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    decodeQRCodeFile(file)
    event.target.value = ''
  }
}
</script>

<style scoped>
.qr-code-tool {
  padding: 20px;
  max-width: 840px;
  margin: 0 auto;
}

.generate-section,
.decode-section {
  background: var(--bg-color-secondary);
  border: 1px solid var(--border-color);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.input-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.input-type-selector button,
.primary-button,
.qr-actions button {
  padding: 8px 14px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
  cursor: pointer;
}

.input-type-selector button.active,
.primary-button,
.qr-actions button {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: #fff;
}

.input-type-selector button:hover,
.primary-button:hover,
.qr-actions button:hover {
  background: var(--primary-color-dark);
  color: #fff;
}

textarea,
input[type='url'] {
  width: 100%;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 10px;
  background: var(--bg-color);
  color: var(--text-color);
}

textarea {
  min-height: 96px;
  resize: vertical;
}

.style-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
  margin: 16px 0;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qr-result,
.decode-result {
  margin-top: 16px;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 14px;
}

.qr-result img {
  max-width: 100%;
  width: min(360px, 100%);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  display: block;
  margin: 0 auto 12px;
}

.qr-actions {
  display: flex;
  justify-content: center;
}

.upload-area {
  border: 2px dashed var(--border-color);
  border-radius: 8px;
  padding: 18px;
  text-align: center;
  background: var(--bg-color);
}

.upload-area input[type='file'] {
  margin-bottom: 8px;
}

.result-content {
  word-break: break-all;
}

.error-message {
  margin-top: 10px;
  color: #d32f2f;
}
</style>
