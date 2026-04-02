<template>
  <div class="app-shell">
    <AppHeader />
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader.vue'
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

:root {
  --font-display: 'Fraunces', 'Noto Serif SC', 'Songti SC', 'STSong', serif;
  --font-body: 'IBM Plex Sans', 'Noto Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  --font-mono: 'IBM Plex Mono', 'SFMono-Regular', Menlo, Consolas, monospace;

  --surface-page: #ecebe6;
  --surface-base: #f6f5ef;
  --surface-card: #ffffff;
  --surface-muted: #efede6;

  --text-primary: #1e1d1a;
  --text-secondary: #5d5a52;
  --text-tertiary: #7c786f;

  --border-weak: #d8d4c9;
  --border-strong: #b8b2a3;

  --accent: #2f3f63;
  --accent-hover: #22314e;
  --danger: #b42318;
  --danger-soft: #f8e7e5;
  --success: #1f7a4d;

  --shadow-sm: 0 1px 2px rgb(17 24 39 / 0.06);
  --shadow-md: 0 8px 30px rgb(15 23 42 / 0.08);

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;

  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;

  --duration-fast: 160ms;
  --easing-standard: cubic-bezier(0.22, 1, 0.36, 1);
}

:root.dark-theme {
  --surface-page: #161718;
  --surface-base: #1d1f20;
  --surface-card: #232629;
  --surface-muted: #1a1c1f;

  --text-primary: #f3f1ea;
  --text-secondary: #c3beb0;
  --text-tertiary: #989282;

  --border-weak: #373a3f;
  --border-strong: #4a4f57;

  --accent: #9eafdb;
  --accent-hover: #bdc8e8;
  --danger: #f97066;
  --danger-soft: #412320;
  --success: #66c98a;

  --shadow-sm: 0 1px 2px rgb(0 0 0 / 0.28);
  --shadow-md: 0 8px 24px rgb(0 0 0 / 0.32);
}

* {
  box-sizing: border-box;
}

html,
body,
#app {
  margin: 0;
  min-height: 100%;
}

body {
  font-family: var(--font-body);
  color: var(--text-primary);
  background-color: var(--surface-page);
  line-height: 1.6;
  text-rendering: optimizeLegibility;
  transition: background-color var(--duration-fast) var(--easing-standard),
    color var(--duration-fast) var(--easing-standard);
}

a {
  color: inherit;
  text-decoration: none;
}

.app-shell {
  min-height: 100vh;
  background-color: var(--surface-page);
}

.app-main {
  width: 100%;
  padding-top: 84px;
}

.page {
  width: min(1120px, 100%);
  margin: 0 auto;
  padding: 36px 24px 48px;
  animation: page-in var(--duration-fast) var(--easing-standard);
}

.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-5);
  margin-bottom: var(--space-8);
}

.page-kicker {
  margin: 0;
  font-size: 0.75rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-tertiary);
}

.page-title {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 2vw, 2.6rem);
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
}

.page-subtitle {
  margin: var(--space-2) 0 0;
  max-width: 680px;
  color: var(--text-secondary);
  font-size: 0.98rem;
}

.panel {
  border: 1px solid var(--border-weak);
  border-radius: var(--radius-lg);
  background-color: var(--surface-card);
  box-shadow: var(--shadow-sm);
}

.panel-muted {
  background-color: var(--surface-muted);
}

.section-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-description {
  margin: 6px 0 0;
  color: var(--text-secondary);
  font-size: 0.92rem;
}

.btn {
  appearance: none;
  border: 1px solid var(--border-weak);
  border-radius: 999px;
  padding: 9px 16px;
  font-size: 0.9rem;
  font-weight: 500;
  background: transparent;
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--easing-standard),
    background-color var(--duration-fast) var(--easing-standard),
    color var(--duration-fast) var(--easing-standard);
}

.btn:hover:not(:disabled) {
  border-color: var(--border-strong);
  background-color: var(--surface-muted);
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-primary {
  border-color: var(--accent);
  background-color: var(--accent);
  color: #f9fafb;
}

.btn-primary:hover:not(:disabled) {
  border-color: var(--accent-hover);
  background-color: var(--accent-hover);
}

.btn-danger {
  border-color: var(--danger);
  color: var(--danger);
}

.btn-danger:hover:not(:disabled) {
  border-color: var(--danger);
  background-color: var(--danger-soft);
}

input,
textarea,
select {
  width: 100%;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-weak);
  background: var(--surface-base);
  color: var(--text-primary);
  font: inherit;
  padding: 10px 12px;
  transition: border-color var(--duration-fast) var(--easing-standard),
    background-color var(--duration-fast) var(--easing-standard);
}

input:focus,
textarea:focus,
select:focus {
  border-color: var(--accent);
  outline: none;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.status {
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-weak);
  color: var(--text-secondary);
  background: var(--surface-muted);
  font-size: 0.9rem;
}

.status-error {
  border-color: var(--danger);
  color: var(--danger);
  background: var(--danger-soft);
}

.code-block,
.mono {
  font-family: var(--font-mono);
}

@keyframes page-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 860px) {
  .app-main {
    padding-top: 76px;
  }

  .page {
    padding: 24px 14px 36px;
  }

  .page-header {
    margin-bottom: var(--space-6);
  }
}
</style>
