import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import QRCodeTool from '../views/QRCodeTool.vue'
import MathTool from '../views/MathTool.vue'
import IPLocation from '../views/IPLocation.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 