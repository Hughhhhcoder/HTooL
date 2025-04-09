<template>
  <div class="markdown-html-converter">
    <h2>Markdown ↔ HTML 互转</h2>
    <textarea v-model="markdownInput" placeholder="输入 Markdown"></textarea>
    <button @click="convertToHtml">转换为 HTML</button>
    <textarea v-model="htmlOutput" placeholder="输出 HTML" readonly></textarea>
    <textarea v-model="htmlInput" placeholder="输入 HTML"></textarea>
    <button @click="convertToMarkdown">转换为 Markdown</button>
    <textarea v-model="markdownOutput" placeholder="输出 Markdown" readonly></textarea>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { marked } from 'marked';

const markdownInput = ref('');
const htmlOutput = ref('');
const htmlInput = ref('');
const markdownOutput = ref('');

const convertToHtml = () => {
  htmlOutput.value = marked(markdownInput.value);
};

const convertToMarkdown = () => {
  // Simple HTML to Markdown conversion (for demonstration)
  markdownOutput.value = htmlInput.value
    .replace(/<h1>(.*?)<\/h1>/g, '# $1')
    .replace(/<h2>(.*?)<\/h2>/g, '## $1')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*');
};
</script>

<style scoped>
.markdown-html-converter {
  padding: 20px;
}

textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
}

button {
  margin: 10px 0;
}
</style> 