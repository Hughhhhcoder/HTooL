# 贡献指南

<p align="right"><a href="./CONTRIBUTING.md">English</a> · 简体中文</p>

感谢你愿意改进 HTooL。小而明确的 Pull Request 更容易被审阅，也更容易保持这个工具箱的稳定和克制。

## 开始之前

1. 确认 Node.js 版本为 20 或更高版本。
2. 安装依赖：`npm ci`。
3. 启动开发环境：`npm run dev`。
4. 对行为变更先搜索现有 Issue，避免重复工作。

## 开发约定

- 页面放在 `src/views/`，跨页面组件放在 `src/components/`，纯逻辑放在 `src/utils/`。
- 新增功能时同步补充单元/组件测试；涉及用户流程时补充 E2E 测试。
- 保持工具页面响应式，并同时检查浅色和暗色模式。
- 项目当前有两个设计门禁：不要在 `src/` 中使用 CSS gradient，并确保构建产物不超过性能预算。
- 不要把密钥、个人数据或真实用户文件提交到仓库。

## 分支与提交

从 `master` 创建分支，例如：

```bash
git switch -c feat/your-change
```

提交信息建议使用简短的 Conventional Commits 风格前缀：

```text
feat: add a new utility
fix: handle invalid input
docs: improve setup guide
refactor: simplify converter state
test: cover keyboard shortcut
```

## 提交 Pull Request

提交前至少运行：

```bash
npm run check
```

如果本地没有 Playwright 浏览器，先运行 `npx playwright install chromium`。PR 描述请说明：

- 做了什么，以及为什么做；
- 如何验证；
- 是否有 UI 变化（有的话附截图或录屏）；
- 是否存在兼容性、性能或破坏性变更。

PR 会经过 CI 检查。维护者可能会要求拆分范围、补测试或调整交互细节。
