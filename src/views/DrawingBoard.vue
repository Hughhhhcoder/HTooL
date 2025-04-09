<template>
  <div class="drawing-board">
    <div class="controls">
      <label for="colorPicker">选择颜色:</label>
      <input type="color" id="colorPicker" v-model="penColor" />
      <button @click="setEraser">橡皮擦</button>
      <label for="eraserSize">橡皮擦大小:</label>
      <input type="range" id="eraserSize" v-model="eraserSize" min="1" max="50" />
    </div>
    <canvas ref="canvas" width="800" height="600" @mousedown="startDrawing" @mousemove="draw" @mouseup="stopDrawing" @mouseleave="stopDrawing"></canvas>
    <button @click="saveDrawing">保存绘图</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const canvas = ref(null);
let context = null;
let isDrawing = false;
const penColor = ref('#000000');
const eraserSize = ref(10);

const startDrawing = (event) => {
  isDrawing = true;
  context.beginPath();
  context.moveTo(event.offsetX, event.offsetY);
};

const draw = (event) => {
  if (!isDrawing) return;
  context.lineWidth = penColor.value === '#ffffff' ? eraserSize.value : 2;
  context.strokeStyle = penColor.value;
  context.lineTo(event.offsetX, event.offsetY);
  context.stroke();
};

const stopDrawing = () => {
  isDrawing = false;
  context.closePath();
};

const setEraser = () => {
  penColor.value = '#ffffff'; // Assuming white is the background color
};

const saveDrawing = () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.value.toDataURL();
  link.click();
};

onMounted(() => {
  context = canvas.value.getContext('2d');
  context.lineWidth = 2;
  context.strokeStyle = penColor.value;
});
</script>

<style scoped>
.drawing-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.controls {
  margin-bottom: 10px;
}

canvas {
  border: 1px solid #ccc;
  cursor: crosshair;
}

button {
  margin-top: 10px;
}
</style> 