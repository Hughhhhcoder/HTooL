<template>
  <section class="page drawing-page">
    <header class="page-header">
      <div>
        <p class="page-kicker">Image & Encoding</p>
        <h1 class="page-title">手绘板</h1>
        <p class="page-subtitle">轻量草图画布，支持触控、橡皮擦和 PNG 导出。</p>
      </div>
    </header>

    <section class="panel controls-panel">
      <div class="controls">
        <label class="control-item">
          <span>画笔颜色</span>
          <input type="color" v-model="penColor" />
        </label>

        <label class="control-item">
          <span>画笔大小 {{ penSize }}px</span>
          <input type="range" v-model.number="penSize" min="1" max="50" />
        </label>

        <div class="control-actions">
          <button class="btn" :class="{ 'btn-primary': isEraser }" @click="setEraser">
            {{ isEraser ? '正在使用橡皮擦' : '切换橡皮擦' }}
          </button>
          <button class="btn" @click="clearCanvas">清空画布</button>
          <button class="btn btn-primary" @click="saveDrawing">保存 PNG</button>
        </div>
      </div>

      <div class="canvas-shell">
        <canvas
          ref="canvas"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart.prevent="startDrawingTouch"
          @touchmove.prevent="drawTouch"
          @touchend.prevent="stopDrawing"
        ></canvas>
      </div>
    </section>
  </section>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const canvas = ref(null)
const penColor = ref('#111111')
const penSize = ref(2)
const isEraser = ref(false)

let context = null
let isDrawing = false
let dpr = 1

const getCanvasCoordinates = (event) => {
  const rect = canvas.value.getBoundingClientRect()

  if (event.type.includes('touch')) {
    return {
      x: event.touches[0].clientX - rect.left,
      y: event.touches[0].clientY - rect.top
    }
  }

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  }
}

const resizeCanvas = () => {
  if (!canvas.value) return

  dpr = window.devicePixelRatio || 1
  const parent = canvas.value.parentElement
  const width = parent.clientWidth
  const height = Math.max(320, Math.min(window.innerHeight * 0.62, 700))

  canvas.value.style.width = `${width}px`
  canvas.value.style.height = `${height}px`
  canvas.value.width = Math.floor(width * dpr)
  canvas.value.height = Math.floor(height * dpr)

  context = canvas.value.getContext('2d')
  context.setTransform(dpr, 0, 0, dpr, 0, 0)
  context.lineCap = 'round'
  context.lineJoin = 'round'
  context.lineWidth = penSize.value
  context.strokeStyle = penColor.value
}

const startDrawing = (event) => {
  if (!context) return
  isDrawing = true
  const point = getCanvasCoordinates(event)
  context.beginPath()
  context.moveTo(point.x, point.y)
}

const draw = (event) => {
  if (!isDrawing || !context) return

  const point = getCanvasCoordinates(event)
  context.lineWidth = isEraser.value ? penSize.value * 2 : penSize.value
  context.strokeStyle = penColor.value
  context.globalCompositeOperation = isEraser.value ? 'destination-out' : 'source-over'
  context.lineTo(point.x, point.y)
  context.stroke()
}

const startDrawingTouch = (event) => {
  startDrawing(event)
}

const drawTouch = (event) => {
  draw(event)
}

const stopDrawing = () => {
  if (!context) return
  isDrawing = false
  context.closePath()
}

const setEraser = () => {
  isEraser.value = !isEraser.value
}

const clearCanvas = () => {
  if (!context || !canvas.value) return
  context.clearRect(0, 0, canvas.value.width / dpr, canvas.value.height / dpr)
}

const saveDrawing = () => {
  if (!canvas.value) return
  const link = document.createElement('a')
  link.download = 'drawing.png'
  link.href = canvas.value.toDataURL('image/png')
  link.click()
}

watch(penColor, (nextColor) => {
  if (context) {
    context.strokeStyle = nextColor
  }
})

watch(penSize, (nextSize) => {
  if (context) {
    context.lineWidth = nextSize
  }
})

onMounted(() => {
  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
.drawing-page {
  display: flex;
  flex-direction: column;
}

.controls-panel {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  align-items: center;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.control-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.canvas-shell {
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  overflow: hidden;
  background: #ffffff;
}

canvas {
  display: block;
  width: 100%;
  touch-action: none;
  cursor: crosshair;
}

@media (max-width: 860px) {
  .controls-panel {
    padding: var(--space-4);
  }

  .controls {
    flex-direction: column;
    align-items: stretch;
  }

  .control-item {
    min-width: 100%;
  }
}
</style>
