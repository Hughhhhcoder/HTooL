<div align="center">
  <img src="./public/favicon.svg" width="88" height="88" alt="HTooL 图标" />
  <h1>HTooL</h1>
  <p>一套浏览器优先的实用工具箱，把常用的小工具收进一个克制、顺手的工作台。</p>
  <p>
    <a href="https://htool.vercel.app/">在线体验</a>
    ·
    <a href="https://github.com/Hughhhhcoder/HTooL/issues/new/choose">报告问题</a>
    ·
    <a href="./CONTRIBUTING.zh-CN.md">参与贡献</a>
  </p>
</div>

<p align="center">
  简体中文 · <a href="./README.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/Hughhhhcoder/HTooL/actions/workflows/ci.yml"><img src="https://github.com/Hughhhhcoder/HTooL/actions/workflows/ci.yml/badge.svg?branch=master" alt="CI 状态" /></a>
  <a href="https://github.com/Hughhhhcoder/HTooL/issues"><img src="https://img.shields.io/github/issues/Hughhhhcoder/HTooL?color=2f3f63" alt="GitHub Issues" /></a>
  <a href="https://htool.vercel.app/"><img src="https://img.shields.io/badge/demo-htool.vercel.app-2f3f63" alt="在线演示" /></a>
</p>

## 项目定位

HTooL 面向写作、开发和日常信息处理场景，优先把数据留在浏览器中完成处理。它不是一个需要账号和后端服务的复杂平台，而是一组打开即用、按任务分组的轻量工具。

## 工具一览

| 分组 | 工具 | 能力 |
| --- | --- | --- |
| 文档创作 | Markdown 编辑器 | 编辑、工具栏、实时预览、本地文件夹读写与保存 |
| 文档创作 | Markdown ↔ HTML | 双向转换、预览、复制与下载 |
| 图像与编码 | 图片格式转换 | 单个/批量转换、PNG/JPG/WebP/GIF 选择、质量调节 |
| 图像与编码 | 二维码工具 | 文本/链接生成、尺寸与颜色设置、图片解析、下载 |
| 图像与编码 | 手绘板 | 画笔、橡皮擦、颜色/粗细调节与 PNG 导出 |
| 系统与数据 | 数据处理工具 | 正则测试、URL 编码/解码、Base64、MD5 与 SHA-256 |
| 系统与数据 | IP 地址定位 | 查询 IPv4 的地域、时区与运营商信息 |

## 主要特点

- 浏览器优先：图片转换、二维码、绘图和文本处理默认在本地完成。
- 按需加载：Markdown、二维码等较重依赖仅在进入对应工具后加载。
- 克制的界面：响应式布局、浅色/暗色模式，以及明确的任务分组。
- 可验证的质量门禁：单元测试、组件测试、E2E 流程、构建体积预算和设计约束检查。
- 可直接部署：Vercel 配置已包含单页应用路由回退规则。

## 技术栈

- [Vue 3](https://vuejs.org/) + [Vue Router](https://router.vuejs.org/)
- [Vite](https://vite.dev/)
- [Vitest](https://vitest.dev/) + [Vue Test Utils](https://test-utils.vuejs.org/)
- [Playwright](https://playwright.dev/)
- [Marked](https://marked.js.org/) + [Turndown](https://github.com/mixmark-io/turndown)
- [DOMPurify](https://github.com/cure53/DOMPurify)
- [QRCode](https://github.com/soldair/node-qrcode) + [jsQR](https://github.com/cozmo/jsQR)

## 快速开始

### 环境要求

- Node.js 20 或更高版本
- npm 10 或更高版本
- 需要运行 E2E 测试时，额外安装 Playwright Chromium

### 本地开发

```bash
git clone https://github.com/Hughhhhcoder/HTooL.git
cd HTooL
npm ci
npm run dev
```

开发服务器默认地址为 <http://localhost:3000>。

### 构建与预览

```bash
npm run build
npm run preview
```

### 运行测试

```bash
# 单元测试与组件测试
npm run test:unit

# 设计约束检查：禁止 CSS gradient
npm run test:no-gradient

# 构建产物性能预算检查
npm run test:perf-budget

# 首次运行前安装 Playwright 浏览器
npx playwright install chromium

# E2E 测试
npm run test:e2e

# 聚合检查：单测 + 设计约束 + 构建 + 性能预算 + E2E
npm run check
```

## 环境变量

复制 `.env.example` 为 `.env` 后按需修改：

| 变量 | 默认值 | 说明 |
| --- | --- | --- |
| `VITE_ENABLE_ANALYTICS` | `false` | 设置为 `true` 后，在生产环境注入 Vercel Analytics。 |

## 隐私与数据边界

- 图片、二维码、绘图、Markdown、编码和哈希处理在浏览器中完成，项目不会因为这些功能主动上传内容到自建服务器。
- “获取当前 IP”会请求 `api.ipify.org`；IP 归属查询会请求 `ipinfo.io`。这两个请求只在使用 IP 工具时发生。
- Vercel Analytics 默认关闭，只有显式设置 `VITE_ENABLE_ANALYTICS=true` 才会启用。
- Markdown 预览和 HTML 预览会经过 DOMPurify 清理；下载 HTML 前仍应审阅内容，尤其不要把不可信内容当作生产页面直接发布。

## 项目结构

```text
.
├── public/                  # favicon 等静态资源
├── scripts/                 # 性能预算与设计约束检查脚本
├── src/
│   ├── components/          # 跨页面组件
│   ├── utils/               # 可复用的转换与校验逻辑
│   ├── views/               # 工具页面
│   ├── App.vue
│   └── router/              # 路由与按需加载
├── tests/
│   ├── component/           # Vue 组件测试
│   ├── e2e/                 # Playwright 端到端流程
│   └── unit/                # 工具函数与路由测试
├── .github/                 # CI、双语模板与依赖更新配置
└── vercel.json              # SPA 部署回退配置
```

## 部署

项目可以直接导入 Vercel：

1. 在 Vercel 中导入本仓库。
2. Framework Preset 选择 Vite（通常会自动识别）。
3. Build Command 使用 `npm run build`。
4. Output Directory 使用 `dist`。
5. 如果需要统计，再设置 `VITE_ENABLE_ANALYTICS=true`。

仓库内的 `vercel.json` 已配置前端路由回退，刷新 `/markdown`、`/qrcode` 等路径时不会被当成静态文件丢失。

## 参与贡献

欢迎提交 Bug 修复、体验改进和新工具。开始之前请阅读 [贡献指南](./CONTRIBUTING.zh-CN.md)，提交 Issue 时尽量提供浏览器、复现步骤和截图。

- [行为准则](./CODE_OF_CONDUCT.zh-CN.md)
- [安全策略](./SECURITY.zh-CN.md)
- [Issue 模板](https://github.com/Hughhhhcoder/HTooL/issues/new/choose)

## 许可证

当前仓库尚未声明开源许可证。除非仓库后续补充明确的许可证文件，否则代码默认不授予复制、修改或分发权限。
