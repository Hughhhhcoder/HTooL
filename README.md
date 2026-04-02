# HTooL

一个基于 Vue 3 + Vite 的在线工具箱，包含 Markdown、图片、二维码、数学、IP 查询等工具页面。

## 功能特点

- 首页工具导航
- Markdown 编辑器（预览/实时预览、文件夹读写）
- 图片格式转换（单个与批量）
- 二维码生成与解析
- Markdown ↔ HTML 互转
- 数学工具（单位换算、公式渲染、统计与行列式）
- 数据处理（正则、URL、Base64、哈希）
- IP 地址定位、番茄钟、手绘板

## 技术栈

- Vue 3
- Vue Router
- Marked
- Highlight.js

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 http://localhost:3000）
npm run dev

# 构建生产版本
npm run build

# 本地预览构建产物
npm run preview

# 单元+组件测试
npm run test:unit

# E2E 测试（需先安装 Playwright 浏览器）
npm run test:e2e

# 构建产物性能预算检查
npm run test:perf-budget

# 聚合检查（单测 + 构建 + 性能预算）
npm run check
```

## 环境变量

- `VITE_ENABLE_ANALYTICS`：是否在生产环境注入 Vercel Analytics（默认 `false`，设置为 `true` 才启用）
