import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import QRCodeTool from '../views/QRCodeTool.vue'
import MathTool from '../views/MathTool.vue'
import IPLocation from '../views/IPLocation.vue'
import DataProcessor from '../views/DataProcessor.vue'
import DrawingBoard from '../views/DrawingBoard.vue'
import MarkdownHtmlConverter from '../views/MarkdownHtmlConverter.vue'
import PomodoroTimer from '../views/PomodoroTimer.vue'
import ImageConverter from '../views/ImageConverter.vue'
import MarkdownEditor from '../views/MarkdownEditor.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/qrcode',
    name: 'QRCodeTool',
    component: QRCodeTool
  },
  {
    path: '/math',
    name: 'MathTool',
    component: MathTool
  },
  {
    path: '/ip-location',
    name: 'IPLocation',
    component: IPLocation
  },
  {
    path: '/data-processor',
    name: 'DataProcessor',
    component: DataProcessor
  },
  {
    path: '/drawing-board',
    name: 'DrawingBoard',
    component: DrawingBoard
  },
  {
    path: '/markdown-html',
    name: 'MarkdownHtmlConverter',
    component: MarkdownHtmlConverter
  },
  {
    path: '/pomodoro',
    name: 'PomodoroTimer',
    component: PomodoroTimer
  },
  {
    path: '/image-converter',
    name: 'ImageConverter',
    component: ImageConverter
  },
  {
    path: '/markdown',
    name: 'MarkdownEditor',
    component: MarkdownEditor
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 