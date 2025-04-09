import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MarkdownEditor from '../views/MarkdownEditor.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router 