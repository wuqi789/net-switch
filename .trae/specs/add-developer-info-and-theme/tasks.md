# Tasks

- [x] Task 1: 启用 Tailwind dark mode 并配置基础主题色
  - [x] SubTask 1.1: 修改 `tailwind.config.js`，添加 `darkMode: 'class'`
  - [x] SubTask 1.2: 在 `index.css` 中为 `html.dark` 添加基础深色背景/文字样式

- [x] Task 2: 创建 ThemeContext 主题上下文
  - [x] SubTask 2.1: 创建 `src/contexts/ThemeContext.tsx`，实现 theme 状态（light/dark/system）、localStorage 持久化、监听 `prefers-color-scheme` 变化
  - [x] SubTask 2.2: 在 `main.tsx` 中用 ThemeProvider 包裹 App

- [x] Task 3: 修改设置标签页，添加主题切换 UI
  - [x] SubTask 3.1: 在 ConfigEditor 上方添加"应用设置"区域，包含浅色/深色/跟随系统三个选项按钮
  - [x] SubTask 3.2: 切换选项时实时应用主题变化

- [x] Task 4: 在侧边栏底部添加开发者信息
  - [x] SubTask 4.1: 在 App.tsx 侧边栏底部状态区下方添加开发者姓名和 mailto 链接

- [x] Task 5: 为所有组件添加 dark: 变体
  - [x] SubTask 5.1: App.tsx — 侧边栏、主内容区深色适配
  - [x] SubTask 5.2: StatusPanel.tsx — 状态面板深色适配
  - [x] SubTask 5.3: ProfileList.tsx + ProfileCard.tsx — 卡片深色适配
  - [x] SubTask 5.4: ConfigEditor.tsx — 编辑器深色适配
  - [x] SubTask 5.5: LogViewer.tsx — 日志深色适配
  - [x] SubTask 5.6: SyncPanel.tsx — 同步面板深色适配
  - [x] SubTask 5.7: RuleEditor.tsx — 规则编辑器深色适配
  - [x] SubTask 5.8: PluginManager.tsx — 插件管理深色适配
  - [x] SubTask 5.9: EncryptConfig.tsx — 加密配置深色适配
  - [x] SubTask 5.10: StatusIndicator.tsx — 状态指示器深色适配
  - [x] SubTask 5.11: ErrorBoundary.tsx — 错误边界深色适配

- [x] Task 6: 验证
  - [x] SubTask 6.1: 运行 TypeScript 类型检查 `npx tsc --noEmit`
  - [x] SubTask 6.2: 运行 Vite 构建确认无编译错误

# Task Dependencies
- Task 2 依赖 Task 1（需要 dark mode 配置才能生效）
- Task 3 依赖 Task 2（需要 ThemeContext 才能切换主题）
- Task 4 独立（可与任何任务并行）
- Task 5 依赖 Task 1（需要 dark: 类可用）
- Task 6 依赖所有前置任务
