<template>
  <div class="drawing-board">
    <div class="controls">
      <label for="colorPicker">选择颜色:</label>
      <input type="color" id="colorPicker" v-model="penColor" />
      <button @click="setEraser">橡皮擦</button>
      <label for="eraserSize">橡皮擦大小:</label>
      <input type="range" id="eraserSize" v-model="eraserSize" min="1" max="50" />
    </div>
    <canvas 
      ref="canvas" 
      :width="canvasWidth" 
      :height="canvasHeight" 
      @mousedown="startDrawing" 
      @mousemove="draw" 
      @mouseup="stopDrawing" 
      @mouseleave="stopDrawing"
      @touchstart.prevent="startDrawingTouch" 
      @touchmove.prevent="drawTouch" 
      @touchend.prevent="stopDrawing"
    ></canvas>
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
const canvasWidth = ref(window.innerWidth * 0.8);
const canvasHeight = ref(window.innerHeight * 0.6);

const getTouchPos = (canvasDom, touchEvent) => {
  const rect = canvasDom.getBoundingClientRect();
  return {
    x: touchEvent.touches[0].clientX - rect.left,
    y: touchEvent.touches[0].clientY - rect.top
  };
};

const startDrawing = (event) => {
  isDrawing = true;
  context.beginPath();
  context.moveTo(event.offsetX, event.offsetY);
};

const draw = (event) => {
  if (!isDrawing) return;
  context.lineWidth = penColor.value === 'eraser' ? eraserSize.value : 2;
  context.strokeStyle = penColor.value === 'eraser' ? 'rgba(0,0,0,1)' : penColor.value;
  context.globalCompositeOperation = penColor.value === 'eraser' ? 'destination-out' : 'source-over';
  context.lineTo(event.offsetX, event.offsetY);
  context.stroke();
  context.globalCompositeOperation = 'source-over';
};

const startDrawingTouch = (event) => {
  const touchPos = getTouchPos(canvas.value, event);
  isDrawing = true;
  context.beginPath();
  context.moveTo(touchPos.x, touchPos.y);
};

const drawTouch = (event) => {
  if (!isDrawing) return;
  const touchPos = getTouchPos(canvas.value, event);
  context.lineWidth = penColor.value === 'eraser' ? eraserSize.value : 2;
  context.strokeStyle = penColor.value === 'eraser' ? 'rgba(0,0,0,1)' : penColor.value;
  context.globalCompositeOperation = penColor.value === 'eraser' ? 'destination-out' : 'source-over';
  context.lineTo(touchPos.x, touchPos.y);
  context.stroke();
  context.globalCompositeOperation = 'source-over';
};

const stopDrawing = () => {
  isDrawing = false;
  context.closePath();
};

const setEraser = () => {
  penColor.value = 'eraser';
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
  max-width: 100%;
  height: auto;
}

button {
  margin-top: 10px;
}
</style> 