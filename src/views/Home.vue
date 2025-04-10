<template>
  <div class="home">
    <div class="tools-grid">
      <div 
        v-for="tool in tools" 
        :key="tool.id"
        class="tool-card"
        @click="tool.action"
      >
        <div class="tool-icon">
          <i :class="tool.icon"></i>
        </div>
        <h3>{{ tool.name }}</h3>
        <p>{{ tool.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const tools = [
  {
    id: 1,
    name: 'Markdown 编辑器',
    description: '强大的 Markdown 编辑器，支持实时预览',
    icon: 'fas fa-file-alt',
    action: () => router.push('/markdown')
  },
  {
    id: 2,
    name: '图片转换',
    description: '支持多种图片格式转换',
    icon: 'fas fa-image',
    action: () => router.push('/image-converter')
  },
  {
    id: 3,
    name: '二维码工具',
    description: '生成和解析二维码',
    icon: 'fas fa-qrcode',
    action: () => router.push('/qrcode')
  },
  {
    id: 4,
    name: 'Markdown ↔ HTML 转换',
    description: 'Markdown 和 HTML 互转',
    icon: 'fas fa-exchange-alt',
    action: () => router.push('/markdown-html')
  },
  {
    id: 5,
    name: '手绘板',
    description: '在线绘图工具',
    icon: 'fas fa-paint-brush',
    action: () => router.push('/drawing-board')
  },
  {
    id: 6,
    name: '番茄钟',
    description: '提高工作效率的计时器',
    icon: 'fas fa-clock',
    action: () => router.push('/pomodoro')
  },
  {
    id: 7,
    name: '数据处理工具',
    description: '数据格式转换和处理',
    icon: 'fas fa-database',
    action: () => router.push('/data-processor')
  },
  {
    id: 8,
    name: '数学工具',
    description: '数学计算和公式编辑',
    icon: 'fas fa-calculator',
    action: () => router.push('/math')
  },
  {
    id: 9,
    name: 'IP 地址定位',
    description: '查询 IP 地址地理位置',
    icon: 'fas fa-map-marker-alt',
    action: () => router.push('/ip-location')
  }
]
</script>

<style scoped>
.home {
  padding: 20px;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.tool-card {
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--primary-color);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.tool-card:hover::before {
  transform: scaleX(1);
}

.tool-icon {
  font-size: 2.5rem;
  color: var(--primary-color);
  margin-bottom: 16px;
  transition: transform 0.3s ease;
}

.tool-card:hover .tool-icon {
  transform: scale(1.1);
}

.tool-card h3 {
  font-size: 1.25rem;
  margin-bottom: 8px;
  color: var(--text-color);
  transition: color 0.3s ease;
}

.tool-card:hover h3 {
  color: var(--primary-color);
}

.tool-card p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.tool-card:hover p {
  color: #888;
}

/* 暗色模式支持 */
.dark-theme .tool-card {
  background: #333;
  border-color: #444;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.dark-theme .tool-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
}

.dark-theme .tool-card p {
  color: #aaa;
}

.dark-theme .tool-card:hover p {
  color: #ccc;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .home {
    padding: 15px;
  }

  .tools-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .tool-card {
    padding: 20px;
  }

  .tool-icon {
    font-size: 2rem;
  }

  .tool-card:hover {
    transform: translateY(-3px);
  }
}
</style> 