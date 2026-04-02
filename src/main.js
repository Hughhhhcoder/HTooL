import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(router)
app.mount('#app')

if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_ANALYTICS === 'true') {
  import('@vercel/analytics')
    .then(({ inject }) => inject())
    .catch((error) => {
      console.warn('Vercel Analytics 注入失败:', error)
    })
}
