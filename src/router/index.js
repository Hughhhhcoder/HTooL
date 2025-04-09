import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MarkdownEditor from '../views/MarkdownEditor.vue'
import ImageConverter from '../views/ImageConverter.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/markdown',
    name: 'MarkdownEditor',
    component: MarkdownEditor
  },
  {
    path: '/image-converter',
    name: 'ImageConverter',
    component: ImageConverter
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 