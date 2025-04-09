<template>
  <div class="qr-code-tool">
    <h2>二维码生成 / 解析</h2>
    <textarea v-model="textInput" placeholder="输入文本生成二维码"></textarea>
    <button @click="generateQRCode">生成二维码</button>
    <div v-if="qrCodeDataUrl">
      <img :src="qrCodeDataUrl" alt="生成的二维码" />
    </div>
    <input type="file" @change="handleFileSelect" accept="image/*" />
    <button @click="decodeQRCode">解析二维码</button>
    <p v-if="decodedText">解析结果: {{ decodedText }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

const textInput = ref('');
const qrCodeDataUrl = ref('');
const decodedText = ref('');

const generateQRCode = async () => {
  try {
    qrCodeDataUrl.value = await QRCode.toDataURL(textInput.value);
  } catch (error) {
    alert('二维码生成失败');
  }
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
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
          decodedText.value = code.data;
        } else {
          alert('二维码解析失败');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};
</script>

<style scoped>
.qr-code-tool {
  padding: 20px;
}

textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
}

button {
  margin: 10px 0;
}

img {
  margin-top: 10px;
  max-width: 100%;
}
</style> 