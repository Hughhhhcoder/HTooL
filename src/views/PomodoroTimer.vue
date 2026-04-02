<template>
  <div class="pomodoro-timer">
    <h2>{{ timerTitle }}</h2>
    <input v-model="timerTitle" placeholder="设置标题" />

    <div class="time-settings">
      <label>分钟:</label>
      <input type="number" v-model.number="customMinutes" min="0" />
      <label>秒:</label>
      <input type="number" v-model.number="customSeconds" min="0" max="59" />
    </div>

    <button @click="setCustomTime">设置时间</button>
    <div class="timer-display">{{ displayTime }}</div>
    <div class="actions">
      <button @click="startTimer">开始</button>
      <button @click="resetTimer">重置</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const timerTitle = ref('番茄钟')
const minutes = ref(25)
const seconds = ref(0)
const customMinutes = ref(25)
const customSeconds = ref(0)

let timerInterval = null

const displayTime = computed(() => {
  const safeMinutes = Math.max(0, Number(minutes.value) || 0)
  const safeSeconds = Math.max(0, Number(seconds.value) || 0)
  return `${safeMinutes}:${safeSeconds.toString().padStart(2, '0')}`
})

const clearTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

const setCustomTime = () => {
  clearTimer()
  const nextMinutes = Math.max(0, Number(customMinutes.value) || 0)
  const nextSeconds = Math.min(59, Math.max(0, Number(customSeconds.value) || 0))
  customMinutes.value = nextMinutes
  customSeconds.value = nextSeconds
  minutes.value = nextMinutes
  seconds.value = nextSeconds
}

const startTimer = () => {
  if (timerInterval) return

  timerInterval = setInterval(() => {
    if (seconds.value === 0) {
      if (minutes.value === 0) {
        clearTimer()
        alert('时间到！')
      } else {
        minutes.value -= 1
        seconds.value = 59
      }
    } else {
      seconds.value -= 1
    }
  }, 1000)
}

const resetTimer = () => {
  clearTimer()
  minutes.value = customMinutes.value
  seconds.value = customSeconds.value
}

onUnmounted(() => {
  clearTimer()
})
</script>

<style scoped>
.pomodoro-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  max-width: 500px;
  margin: 0 auto;
}

input {
  padding: 8px 10px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--bg-color);
  color: var(--text-color);
}

.time-settings {
  display: grid;
  grid-template-columns: auto 80px auto 80px;
  align-items: center;
  gap: 8px;
}

.timer-display {
  font-size: 4.5rem;
  line-height: 1;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 10px 18px;
  border: none;
  border-radius: 6px;
  background: var(--primary-color);
  color: #fff;
  cursor: pointer;
}

button:hover {
  background: var(--primary-color-dark);
}
</style>
