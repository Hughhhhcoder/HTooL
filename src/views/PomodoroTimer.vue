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
</style> 