<template>
  <div class="drawing-board">
    <div class="controls">
      <div class="control-group">
        <label for="colorPicker">画笔颜色:</label>
        <input type="color" id="colorPicker" v-model="penColor" />
      </div>
      <div class="control-group">
        <label for="penSize">画笔大小:</label>
        <input type="range" id="penSize" v-model="penSize" min="1" max="50" />
        <span>{{ penSize }}px</span>
      </div>
      <div class="control-group">
        <button @click="setEraser" :class="{ active: isEraser }">橡皮擦</button>
        <button @click="clearCanvas">清空画布</button>
      </div>
    </div>
    <div class="canvas-container">
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
    </div>
    <div class="actions">
      <button @click="saveDrawing" class="save-button">
        <i class="fas fa-save"></i> 保存绘图
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const canvas = ref(null);
let context = null;
let isDrawing = false;
let lastX = 0;
let lastY = 0;
const penColor = ref('#000000');
const penSize = ref(2);
const isEraser = ref(false);
const canvasWidth = ref(window.innerWidth * 0.8);
const canvasHeight = ref(window.innerHeight * 0.6);

// 获取设备像素比
const getDevicePixelRatio = () => {
  return window.devicePixelRatio || 1;
};

// 初始化画布
const initCanvas = () => {
  const dpr = getDevicePixelRatio();
  const rect = canvas.value.getBoundingClientRect();
  
  // 设置画布实际大小
  canvas.value.width = rect.width * dpr;
  canvas.value.height = rect.height * dpr;
  
  // 设置画布显示大小
  canvas.value.style.width = `${rect.width}px`;
  canvas.value.style.height = `${rect.height}px`;
  
  context = canvas.value.getContext('2d');
  context.scale(dpr, dpr);
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.lineWidth = penSize.value;
  context.strokeStyle = penColor.value;
};

// 获取画布坐标
const getCanvasCoordinates = (event) => {
  const rect = canvas.value.getBoundingClientRect();
  const scaleX = canvas.value.width / rect.width;
  const scaleY = canvas.value.height / rect.height;
  
  if (event.type.includes('touch')) {
    return {
      x: (event.touches[0].clientX - rect.left) * scaleX,
      y: (event.touches[0].clientY - rect.top) * scaleY
    };
  } else {
    return {
      x: (event.offsetX) * scaleX,
      y: (event.offsetY) * scaleY
    };
  }
};

const startDrawing = (event) => {
  isDrawing = true;
  const coords = getCanvasCoordinates(event);
  lastX = coords.x;
  lastY = coords.y;
  context.beginPath();
  context.moveTo(lastX, lastY);
};

const draw = (event) => {
  if (!isDrawing) return;
  
  const coords = getCanvasCoordinates(event);
  context.lineWidth = isEraser.value ? penSize.value * 2 : penSize.value;
  context.strokeStyle = isEraser.value ? '#FFFFFF' : penColor.value;
  context.globalCompositeOperation = isEraser.value ? 'destination-out' : 'source-over';
  
  context.lineTo(coords.x, coords.y);
  context.stroke();
  
  lastX = coords.x;
  lastY = coords.y;
};

const startDrawingTouch = (event) => {
  event.preventDefault();
  startDrawing(event);
};

const drawTouch = (event) => {
  event.preventDefault();
  draw(event);
};

const stopDrawing = () => {
  isDrawing = false;
  context.closePath();
};

const setEraser = () => {
  isEraser.value = !isEraser.value;
};

const clearCanvas = () => {
  context.clearRect(0, 0, canvas.value.width, canvas.value.height);
};

const saveDrawing = () => {
  const link = document.createElement('a');
  link.download = 'drawing.png';
  link.href = canvas.value.toDataURL('image/png');
  link.click();
};

// 监听窗口大小变化
const handleResize = () => {
  canvasWidth.value = window.innerWidth * 0.8;
  canvasHeight.value = window.innerHeight * 0.6;
  initCanvas();
};

onMounted(() => {
  initCanvas();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.drawing-board {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  min-height: 100vh;
  background: var(--bg-color);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--bg-color-secondary);
  border-radius: 8px;
  width: 100%;
  max-width: 800px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group label {
  color: var(--text-color);
  font-weight: 500;
}

.canvas-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  margin-bottom: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

canvas {
  display: block;
  width: 100%;
  height: auto;
  cursor: crosshair;
  touch-action: none;
}

button {
  padding: 0.5rem 1rem;
  background: var(--bg-color);
  color: var(--text-color);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

button.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.save-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--primary-color);
  color: white;
  border: none;
}

.save-button:hover {
  background: var(--primary-color-dark);
}

input[type="color"] {
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

input[type="range"] {
  width: 100px;
}

@media (max-width: 768px) {
  .drawing-board {
    padding: 1rem;
  }
  
  .controls {
    flex-direction: column;
  }
  
  .control-group {
    width: 100%;
  }
  
  input[type="range"] {
    flex: 1;
  }
}
</style> 