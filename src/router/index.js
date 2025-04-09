import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MarkdownEditor from '../views/MarkdownEditor.vue'
import Translator from '../views/Translator.vue'

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
    path: '/translator',
    name: 'Translator',
    component: Translator
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 