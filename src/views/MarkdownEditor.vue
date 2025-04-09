<template>
  <div class="container">
    <div class="toolbar">
      <button @click="goBack">返回</button>
      <button @click="openFileOrDirectory">打开</button>
      <button @click="saveFile">保存</button>
      <button @click="createNewFile" v-if="currentDirectory">新建</button>
      <button @click="createNewFolder" v-if="currentDirectory">新建文件夹</button>
      <button @click="togglePreview" class="preview-toggle">
        {{ showPreview ? '关闭预览' : '预览' }}
      </button>
    </div>
    <div class="content-wrapper">
      <div class="file-explorer" v-if="currentDirectory">
        <div class="directory-path">
          <span>{{ currentDirectory.name }}</span>
          <button class="refresh-btn" @click="refreshDirectory">刷新</button>
        </div>
        <div class="file-tree">
          <file-tree-item
            v-for="item in directoryFiles"
            :key="item.name"
            :item="item"
            :level="0"
            @open-file="openFileFromDirectory"
            @open-folder="openSubFolder"
          />
        </div>
      </div>
      <div class="editor-area" :class="{ 'with-preview': showPreview }">
        <textarea
          v-model="markdownContent"
          class="editor-textarea"
          placeholder="在这里输入 Markdown 内容..."
          @input="updatePreview"
        ></textarea>
        <div class="preview" v-if="showPreview">
          <div class="preview-content" v-html="previewContent"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { marked } from 'marked'
import hljs from 'highlight.js'

const router = useRouter()

// 配置 marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true
})

const markdownContent = ref('')
const previewContent = ref('')
const currentDirectory = ref(null)
const directoryFiles = ref([])
const currentFileHandle = ref(null)
const showPreview = ref(false)

const goBack = () => {
  router.push('/')
}

const togglePreview = () => {
  showPreview.value = !showPreview.value
}

const updatePreview = () => {
  previewContent.value = marked.parse(markdownContent.value)
}

// ... 其余代码保持不变 ...
</script>

<style scoped>
/* 样式保持不变 */
</style> 