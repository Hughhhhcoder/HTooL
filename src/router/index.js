import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MarkdownEditor from '../views/MarkdownEditor.vue'
import ImageConverter from '../views/ImageConverter.vue'
// import JsonTableConverter from '../views/JsonTableConverter.vue'
import QRCodeTool from '../views/QRCodeTool.vue'
import MarkdownHtmlConverter from '../views/MarkdownHtmlConverter.vue'
import DrawingBoard from '../views/DrawingBoard.vue'
import PomodoroTimer from '../views/PomodoroTimer.vue'
import DataProcessor from '../views/DataProcessor.vue'
import MathTool from '../views/MathTool.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/markdown',
      name: 'markdown',
      component: MarkdownEditor
    },
    {
      path: '/image-converter',
      name: 'image-converter',
      component: ImageConverter
    },
    {
      path: '/qr-code-tool',
      name: 'qr-code-tool',
      component: QRCodeTool
    },
    {
      path: '/markdown-html-converter',
      name: 'markdown-html-converter',
      component: MarkdownHtmlConverter
    },
    {
      path: '/drawing-board',
      name: 'drawing-board',
      component: DrawingBoard
    },
    {
      path: '/pomodoro-timer',
      name: 'pomodoro-timer',
      component: PomodoroTimer
    },
    {
      path: '/data-processor',
      name: 'data-processor',
      component: DataProcessor
    },
    {
      path: '/math-tool',
      name: 'math-tool',
      component: MathTool
    }
  ]
})

export default router 