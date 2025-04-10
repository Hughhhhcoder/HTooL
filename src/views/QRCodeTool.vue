<template>
  <div class="qr-code-tool">
    <h2>二维码生成 / 解析</h2>
    
    <!-- 生成部分 -->
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

      <!-- 文本输入 -->
      <textarea 
        v-if="currentInputType === 'text'" 
        v-model="textInput" 
        placeholder="输入文本生成二维码"
      ></textarea>

      <!-- 链接输入 -->
      <input 
        v-if="currentInputType === 'url'" 
        type="url" 
        v-model="urlInput" 
        placeholder="输入链接生成二维码"
      />

      <!-- 样式设置 -->
      <div class="style-settings">
        <div class="setting-item">
          <label>二维码尺寸:</label>
          <input type="number" v-model="qrSize" min="300" max="800" step="50" />
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
          <input type="number" v-model="margin" min="0" max="4" step="1" />
        </div>
      </div>

      <button @click="generateQRCode" class="primary-button">生成二维码</button>
      
      <!-- 生成结果 -->
      <div v-if="qrCodeDataUrls.length" class="qr-result">
        <img :src="qrCodeDataUrls[0]" alt="生成的二维码" />
        <div class="qr-actions">
          <button @click="downloadQRCode">下载二维码</button>
        </div>
      </div>
    </div>

    <!-- 解析部分 -->
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
          <a v-if="isValidUrl(decodedResult.text)" :href="decodedResult.text" target="_blank">打开链接</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

// 状态管理
const currentInputType = ref('text');
const textInput = ref('');
const urlInput = ref('');
const qrCodeDataUrls = ref([]);
const decodedResult = ref(null);

// 样式设置
const qrSize = ref(400);
const darkColor = ref('#000000');
const lightColor = ref('#FFFFFF');
const margin = ref(2);

// 输入类型选项
const inputTypes = [
  { label: '文本', value: 'text' },
  { label: '链接', value: 'url' }
];

// 生成二维码
const generateQRCode = async () => {
  try {
    let content = '';
    switch (currentInputType.value) {
      case 'text':
        content = textInput.value;
        break;
      case 'url':
        content = urlInput.value;
        break;
    }

    if (!content) {
      alert('请输入内容');
      return;
    }

    const options = {
      width: qrSize.value,
      margin: margin.value,
      color: {
        dark: darkColor.value,
        light: lightColor.value
      },
      errorCorrectionLevel: 'H',
      type: 'image/jpeg',
      quality: 1.0,
      scale: 4
    };

    // 生成单个二维码
    qrCodeDataUrls.value = [await QRCode.toDataURL(content, options)];
  } catch (error) {
    console.error('QR Code Generation Error:', error);
    alert('二维码生成失败: ' + error.message);
  }
};

// 下载二维码
const downloadQRCode = () => {
  if (qrCodeDataUrls.value.length === 0) return;
  
  const link = document.createElement('a');
  link.download = 'qrcode.png';
  link.href = qrCodeDataUrls.value[0];
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// 处理文件拖放
const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleQRCodeDecode(file);
  }
};

// 解析二维码
const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    handleQRCodeDecode(file);
  }
};

const handleQRCodeDecode = (file) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, img.width, img.height);
      const imageData = context.getImageData(0, 0, img.width, img.height);
      const code = jsQR(imageData.data, img.width, img.height);
      
      if (code) {
        decodedResult.value = {
          text: code.data,
          type: detectContentType(code.data)
        };
      } else {
        alert('二维码解析失败');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
};

// 检测内容类型
const detectContentType = (content) => {
  if (isValidUrl(content)) return 'URL';
  if (content.startsWith('tel:')) return '电话号码';
  if (content.startsWith('mailto:')) return '邮箱地址';
  if (/^[0-9]+$/.test(content)) return '数字';
  return '文本';
};

// 验证URL
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};
</script>

<style scoped>
.qr-code-tool {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.generate-section, .decode-section {
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.input-type-selector {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.input-type-selector button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #f8f9fa;
  color: #333;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.input-type-selector button.active {
  background: #007bff;
  color: white;
  border-color: #0056b3;
}

.input-type-selector button:hover {
  background: #e9ecef;
  border-color: #adb5bd;
}

textarea, input[type="url"] {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

textarea {
  height: 100px;
  resize: vertical;
}

.style-settings {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin: 20px 0;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.setting-item label {
  min-width: 80px;
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

.primary-button:hover {
  background: #0056b3;
}

.qr-result {
  margin-top: 20px;
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.qr-result img {
  max-width: 400px; /* 增加预览尺寸 */
  margin-bottom: 15px;
  border: 1px solid #e9ecef;
  padding: 5px;
  background: white; /* 确保背景为白色 */
}

.qr-result button {
  background: #28a745;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s ease;
}

.qr-result button:hover {
  background: #218838;
}

.upload-area {
  border: 2px dashed #adb5bd;
  padding: 20px;
  text-align: center;
  border-radius: 4px;
  margin: 20px 0;
  cursor: pointer;
  background-color: #f1f3f5;
  transition: all 0.2s ease;
}

.upload-area:hover {
  border-color: #007bff;
  background-color: #e6f2ff;
}

.image-upload input[type="file"],
.upload-area input[type="file"] {
  margin-bottom: 10px;
}

.upload-area p {
  color: #495057;
  font-weight: 500;
  margin: 10px 0 0;
}

.decode-result {
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-content {
  word-break: break-all;
}

.preview-image {
  max-width: 200px;
  margin-top: 10px;
}

.image-url {
  margin: 10px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  word-break: break-all;
}

.image-url a {
  color: #007bff;
  text-decoration: none;
}

.image-url a:hover {
  text-decoration: underline;
}

.qr-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 15px;
}

.qr-navigation button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: #f8f9fa;
  cursor: pointer;
}

.qr-navigation button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.qr-actions {
  margin-top: 15px;
  text-align: center;
}

.compression-settings {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.compression-settings h4 {
  margin: 0 0 15px 0;
  color: #495057;
}

.setting-item span {
  margin-left: 10px;
  color: #666;
}

.qr-instructions {
  margin: 15px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  text-align: left;
}

.qr-instructions p {
  font-weight: bold;
  margin-bottom: 10px;
}

.qr-instructions ol {
  margin: 0;
  padding-left: 20px;
}

.qr-instructions li {
  margin-bottom: 5px;
}

.compression-tips {
  margin-top: 15px;
  padding: 10px;
  background: #fff3cd;
  border-radius: 4px;
  color: #856404;
  font-size: 0.9em;
}

.compression-tips p {
  font-weight: bold;
  margin-bottom: 5px;
}

.compression-tips ul {
  margin: 5px 0;
  padding-left: 20px;
}

.compression-tips li {
  margin-bottom: 3px;
  line-height: 1.4;
}

/* 暗色模式支持 */
.dark-theme .qrcode-container {
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

.dark-theme .qrcode-preview {
  background: #333;
  border-color: #444;
}

.dark-theme .qrcode-preview .placeholder {
  color: #666;
}

.dark-theme .qrcode-preview .placeholder i {
  color: #444;
}

.dark-theme .qrcode-preview img {
  border-color: #444;
}

.dark-theme .download-options {
  background: #333;
  border-color: #444;
}

.dark-theme .download-options h4 {
  color: #fff;
}

.dark-theme .download-options select {
  background: #2d2d2d;
  border-color: #444;
  color: #ddd;
}

.dark-theme .download-options select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.dark-theme .download-options button {
  background: #3a3a3a;
  border-color: #444;
  color: #ddd;
}

.dark-theme .download-options button:hover {
  background: #444;
  color: #fff;
}

.dark-theme .download-options button:active {
  background: #333;
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