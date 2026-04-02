import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/qrcode',
    name: 'QRCodeTool',
    component: () => import('../views/QRCodeTool.vue')
  },
  {
    path: '/math',
    redirect: '/'
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
    redirect: '/'
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
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
