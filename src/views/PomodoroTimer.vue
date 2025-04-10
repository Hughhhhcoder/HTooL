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
    <div class="timer-display">{{ minutes }}:{{ seconds < 10 ? '0' + seconds : seconds }}</div>
    <button @click="startTimer">开始</button>
    <button @click="resetTimer">重置</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const timerTitle = ref('番茄钟');
const minutes = ref(25);
const seconds = ref(0);
const customMinutes = ref(25);
const customSeconds = ref(0);
let timerInterval = null;

const setCustomTime = () => {
  minutes.value = customMinutes.value;
  seconds.value = customSeconds.value;
};

const startTimer = () => {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (seconds.value === 0) {
      if (minutes.value === 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        alert('时间到！');
      } else {
        minutes.value--;
        seconds.value = 59;
      }
    } else {
      seconds.value--;
    }
  }, 1000);
};

const resetTimer = () => {
  clearInterval(timerInterval);
  timerInterval = null;
  minutes.value = customMinutes.value;
  seconds.value = customSeconds.value;
};
</script>

<style scoped>
.pomodoro-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.time-settings {
  margin-bottom: 10px;
}

.timer-display {
  font-size: 5rem;
  margin-bottom: 20px;
}

button {
  margin: 5px;
}

/* 暗色模式支持 */
.dark-theme .pomodoro-container {
  background: #2d2d2d;
  border-color: #444;
}

.dark-theme .timer-display {
  background: #333;
  border-color: #444;
}

.dark-theme .timer-display .time {
  color: #fff;
}

.dark-theme .timer-display .status {
  color: #aaa;
}

.dark-theme .timer-controls {
  background: #333;
  border-color: #444;
}

.dark-theme .timer-controls button {
  background: #3a3a3a;
  border-color: #444;
  color: #ddd;
}

.dark-theme .timer-controls button:hover {
  background: #444;
  color: #fff;
}

.dark-theme .timer-controls button:active {
  background: #333;
}

.dark-theme .timer-controls button.start {
  background: var(--primary-color);
  color: #fff;
}

.dark-theme .timer-controls button.start:hover {
  background: #0056b3;
}

.dark-theme .timer-controls button.pause {
  background: #ffc107;
  color: #000;
}

.dark-theme .timer-controls button.pause:hover {
  background: #e0a800;
}

.dark-theme .timer-controls button.reset {
  background: #dc3545;
  color: #fff;
}

.dark-theme .timer-controls button.reset:hover {
  background: #c82333;
}

.dark-theme .settings {
  background: #333;
  border-color: #444;
}

.dark-theme .settings h4 {
  color: #fff;
  border-color: #444;
}

.dark-theme .settings label {
  color: #ddd;
}

.dark-theme .settings input[type="number"] {
  background: #2d2d2d;
  border-color: #444;
  color: #ddd;
}

.dark-theme .settings input[type="number"]:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.dark-theme .settings select {
  background: #2d2d2d;
  border-color: #444;
  color: #ddd;
}

.dark-theme .settings select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.dark-theme .settings button {
  background: #3a3a3a;
  border-color: #444;
  color: #ddd;
}

.dark-theme .settings button:hover {
  background: #444;
  color: #fff;
}

.dark-theme .settings button:active {
  background: #333;
}

.dark-theme .stats {
  background: #333;
  border-color: #444;
}

.dark-theme .stats h4 {
  color: #fff;
  border-color: #444;
}

.dark-theme .stats .stat-item {
  border-color: #444;
  color: #ddd;
}

.dark-theme .stats .stat-label {
  color: #aaa;
}

.dark-theme .stats .stat-value {
  color: #fff;
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

/* 暗色模式下的通知样式 */
.dark-theme .notification {
  background: #333;
  border-color: #444;
  color: #ddd;
}

.dark-theme .notification.success {
  border-color: #28a745;
  color: #6cff6c;
}

.dark-theme .notification.error {
  border-color: #dc3545;
  color: #ff6b6b;
}

.dark-theme .notification.warning {
  border-color: #ffc107;
  color: #ffd700;
}

/* 暗色模式下的进度条样式 */
.dark-theme .progress-bar {
  background: #2d2d2d;
}

.dark-theme .progress-bar .progress {
  background: var(--primary-color);
}

/* 暗色模式下的声音控制样式 */
.dark-theme .sound-controls {
  background: #333;
  border-color: #444;
}

.dark-theme .sound-controls h4 {
  color: #fff;
}

.dark-theme .sound-controls input[type="range"] {
  background: #2d2d2d;
}

.dark-theme .sound-controls input[type="range"]::-webkit-slider-thumb {
  background: var(--primary-color);
  border-color: #444;
}

.dark-theme .sound-controls input[type="range"]::-moz-range-thumb {
  background: var(--primary-color);
  border-color: #444;
}

.dark-theme .sound-controls .volume-value {
  color: #ddd;
}

/* 暗色模式下的任务列表样式 */
.dark-theme .task-list {
  background: #333;
  border-color: #444;
}

.dark-theme .task-list h4 {
  color: #fff;
  border-color: #444;
}

.dark-theme .task-item {
  border-color: #444;
  color: #ddd;
}

.dark-theme .task-item:hover {
  background: #3a3a3a;
}

.dark-theme .task-item .task-name {
  color: #ddd;
}

.dark-theme .task-item .task-actions {
  color: #aaa;
}

.dark-theme .task-item:hover .task-actions {
  color: #fff;
}

.dark-theme .task-item input[type="checkbox"] {
  border-color: #666;
  background: #333;
}

.dark-theme .task-item input[type="checkbox"]:checked {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

/* 暗色模式下的历史记录样式 */
.dark-theme .history {
  background: #333;
  border-color: #444;
}

.dark-theme .history h4 {
  color: #fff;
  border-color: #444;
}

.dark-theme .history-item {
  border-color: #444;
  color: #ddd;
}

.dark-theme .history-item:hover {
  background: #3a3a3a;
}

.dark-theme .history-item .history-date {
  color: #aaa;
}

.dark-theme .history-item .history-duration {
  color: #fff;
}

/* 暗色模式下的导出选项样式 */
.dark-theme .export-options {
  background: #333;
  border-color: #444;
}

.dark-theme .export-options h4 {
  color: #fff;
}

.dark-theme .export-options select {
  background: #2d2d2d;
  border-color: #444;
  color: #ddd;
}

.dark-theme .export-options select:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.dark-theme .export-options button {
  background: #3a3a3a;
  border-color: #444;
  color: #ddd;
}

.dark-theme .export-options button:hover {
  background: #444;
  color: #fff;
}

.dark-theme .export-options button:active {
  background: #333;
}
</style> 