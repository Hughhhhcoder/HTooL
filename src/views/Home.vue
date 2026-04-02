<template>
  <section class="page home-page">
    <header class="page-header">
      <div>
        <p class="page-kicker">HTooL · Tool Atlas</p>
        <h1 class="page-title">分组式工具画廊</h1>
        <p class="page-subtitle">
          以任务为中心重排工具：文档创作、图像与编码、系统与数据。功能不减，界面更克制。
        </p>
      </div>
    </header>

    <section v-for="group in groupedTools" :key="group.id" class="group panel">
      <header class="group-header">
        <h2 class="group-title">{{ group.name }}</h2>
        <p class="group-description">{{ group.description }}</p>
      </header>

      <div class="tool-grid">
        <article
          v-for="tool in group.items"
          :key="tool.id"
          class="tool-card"
          role="button"
          tabindex="0"
          @click="go(tool.path)"
          @keyup.enter="go(tool.path)"
        >
          <p class="tool-kicker">{{ tool.kicker }}</p>
          <h3>{{ tool.name }}</h3>
          <p class="tool-description">{{ tool.description }}</p>
          <span class="tool-entry">进入工具</span>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const groupedTools = [
  {
    id: 'writing',
    name: '文档创作',
    description: '面向文本编写、格式互转与内容组织的日常流程。',
    items: [
      {
        id: 'markdown-editor',
        name: 'Markdown 编辑器',
        kicker: 'Writing',
        description: '支持实时预览、文件管理与本地保存。',
        path: '/markdown'
      },
      {
        id: 'markdown-html',
        name: 'Markdown ↔ HTML',
        kicker: 'Converter',
        description: '双向转换并快速复制导出结果。',
        path: '/markdown-html'
      }
    ]
  },
  {
    id: 'image-and-code',
    name: '图像与编码',
    description: '围绕图片资产、二维码和可视化表达的轻量工具集。',
    items: [
      {
        id: 'image-converter',
        name: '图片转换器',
        kicker: 'Batch',
        description: '支持批量格式转换与质量控制。',
        path: '/image-converter'
      },
      {
        id: 'qrcode',
        name: '二维码工具',
        kicker: 'Encode / Decode',
        description: '生成二维码并解析上传图片内容。',
        path: '/qrcode'
      },
      {
        id: 'drawing-board',
        name: '手绘板',
        kicker: 'Canvas',
        description: '自由绘制草图并导出 PNG。',
        path: '/drawing-board'
      }
    ]
  },
  {
    id: 'system-data',
    name: '系统与数据',
    description: '处理文本编码、哈希校验和网络基础信息查询。',
    items: [
      {
        id: 'data-processor',
        name: '数据处理工具',
        kicker: 'Utility',
        description: '正则测试、URL/Base64、哈希计算一站完成。',
        path: '/data-processor'
      },
      {
        id: 'ip-location',
        name: 'IP 地址定位',
        kicker: 'Network',
        description: '快速查询 IP 的地理归属与网络信息。',
        path: '/ip-location'
      }
    ]
  }
]

const go = (path) => {
  router.push(path)
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.group {
  padding: var(--space-6);
}

.group-header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: var(--space-5);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-weak);
}

.group-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 1.35rem;
  color: var(--text-primary);
}

.group-description {
  margin: 0;
  max-width: 560px;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: var(--space-4);
}

.tool-card {
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-md);
  background: var(--surface-base);
  padding: var(--space-5);
  cursor: pointer;
  outline: none;
  transition: border-color var(--duration-fast) var(--easing-standard),
    transform var(--duration-fast) var(--easing-standard),
    box-shadow var(--duration-fast) var(--easing-standard);
}

.tool-card:hover,
.tool-card:focus-visible {
  border-color: var(--border-strong);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.tool-kicker {
  margin: 0;
  color: var(--text-tertiary);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.72rem;
}

.tool-card h3 {
  margin: 8px 0 6px;
  font-size: 1.05rem;
  color: var(--text-primary);
}

.tool-description {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.tool-entry {
  display: inline-block;
  margin-top: 18px;
  color: var(--accent);
  font-size: 0.84rem;
  font-weight: 600;
}

@media (max-width: 860px) {
  .group {
    padding: var(--space-4);
  }

  .tool-grid {
    grid-template-columns: 1fr;
  }
}
</style>
