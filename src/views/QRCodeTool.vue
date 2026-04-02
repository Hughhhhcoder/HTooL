<template>
  <section class="page qr-page">
    <header class="page-header">
      <div>
        <p class="page-kicker">Image & Encoding</p>
        <h1 class="page-title">二维码生成与解析</h1>
        <p class="page-subtitle">支持文本与链接生成，可上传图片并识别内容类型。</p>
      </div>
    </header>

    <div class="panel-grid">
      <section class="panel block">
        <h2 class="section-title">生成二维码</h2>
        <p class="section-description">输入文本或 URL，自定义尺寸与色彩后生成下载。</p>

        <div class="segment">
          <button
            v-for="type in inputTypes"
            :key="type.value"
            class="btn"
            :class="{ 'btn-primary': currentInputType === type.value }"
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
          v-else
          type="url"
          v-model="urlInput"
          placeholder="输入链接生成二维码"
        />

        <div class="setting-grid">
          <label class="setting-item">
            <span>尺寸</span>
            <input type="number" v-model.number="qrSize" min="200" max="800" step="50" />
          </label>

          <label class="setting-item">
            <span>边距</span>
            <input type="number" v-model.number="margin" min="0" max="4" step="1" />
          </label>

          <label class="setting-item">
            <span>前景色</span>
            <input type="color" v-model="darkColor" />
          </label>

          <label class="setting-item">
            <span>背景色</span>
            <input type="color" v-model="lightColor" />
          </label>
        </div>

        <div class="action-row">
          <button class="btn btn-primary" @click="generateQRCode" :disabled="isGenerating">
            {{ isGenerating ? '生成中...' : '生成二维码' }}
          </button>
          <button class="btn" @click="downloadQRCode" :disabled="!qrCodeDataUrl">下载二维码</button>
        </div>

        <p v-if="errorMessage" class="status status-error">{{ errorMessage }}</p>

        <div v-if="qrCodeDataUrl" class="qr-result">
          <img :src="qrCodeDataUrl" alt="生成的二维码" />
        </div>
      </section>

      <section class="panel block">
        <h2 class="section-title">解析二维码</h2>
        <p class="section-description">拖拽或上传图片，即时识别二维码内容。</p>

        <div class="upload-area" @drop.prevent="handleDrop" @dragover.prevent>
          <input type="file" @change="handleFileSelect" accept="image/*" ref="fileInput" />
          <p>点击上传或拖拽图片到此处</p>
        </div>

        <div v-if="decodedResult" class="decoded panel panel-muted">
          <p><strong>内容：</strong>{{ decodedResult.text }}</p>
          <p><strong>类型：</strong>{{ decodedResult.type || '文本' }}</p>
          <a
            v-if="isValidUrl(decodedResult.text)"
            :href="decodedResult.text"
            target="_blank"
            rel="noopener noreferrer"
          >
            打开链接
          </a>
        </div>
      </section>
    </div>
  </section>
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
const darkColor = ref('#111111')
const lightColor = ref('#ffffff')
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

  const [qrModule, jsqrModule] = await Promise.all([import('qrcode'), import('jsqr')])

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
.qr-page {
  display: flex;
  flex-direction: column;
}

.panel-grid {
  display: grid;
  gap: var(--space-4);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.block {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.segment {
  display: flex;
  gap: 8px;
}

.setting-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.qr-result {
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--surface-base);
  padding: var(--space-4);
}

.qr-result img {
  width: min(360px, 100%);
  margin: 0 auto;
  display: block;
}

.upload-area {
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-md);
  background: var(--surface-base);
  padding: var(--space-6);
  text-align: center;
}

.upload-area p {
  margin: 8px 0 0;
  color: var(--text-secondary);
}

.decoded {
  padding: var(--space-4);
  color: var(--text-secondary);
}

.decoded p {
  margin: 0 0 8px;
}

.decoded a {
  color: var(--accent);
  font-weight: 600;
}

@media (max-width: 980px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }

  .block {
    padding: var(--space-4);
  }

  .setting-grid {
    grid-template-columns: 1fr;
  }
}
</style>
