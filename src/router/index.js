import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/qrcode',
    name: 'QRCodeTool',
    component: () => import('../views/QRCodeTool.vue')
  },
  {
    path: '/math',
    name: 'MathTool',
    component: () => import('../views/MathTool.vue')
  },
  {
    path: '/ip-location',
    name: 'IPLocation',
    component: () => import('../views/IPLocation.vue')
  },
  {
    path: '/data-processor',
    name: 'DataProcessor',
    component: () => import('../views/DataProcessor.vue')
  },
  {
    path: '/drawing-board',
    name: 'DrawingBoard',
    component: () => import('../views/DrawingBoard.vue')
  },
  {
    path: '/markdown-html',
    name: 'MarkdownHtmlConverter',
    component: () => import('../views/MarkdownHtmlConverter.vue')
  },
  {
    path: '/pomodoro',
    name: 'PomodoroTimer',
    component: () => import('../views/PomodoroTimer.vue')
  },
  {
    path: '/image-converter',
    name: 'ImageConverter',
    component: () => import('../views/ImageConverter.vue')
  },
  {
    path: '/markdown',
    name: 'MarkdownEditor',
    component: () => import('../views/MarkdownEditor.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router 
