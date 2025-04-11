import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'highlight.js/styles/github.css'
import { inject } from '@vercel/analytics'

// 初始化 Vercel Analytics
inject()

const app = createApp(App)
app.use(router)
app.mount('#app') 