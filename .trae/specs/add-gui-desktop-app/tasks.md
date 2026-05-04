# Tasks

## Task 1: 初始化 Tauri + React 项目
- [x] SubTask 1.1: 创建 `net-switch-gui/` 目录，初始化 Tauri 项目
- [x] SubTask 1.2: 配置 React + TypeScript + Tailwind CSS
- [x] SubTask 1.3: 配置 Tauri 窗口参数（标题、尺寸、图标）
- [x] SubTask 1.4: 验证 `npm run tauri dev` 可启动

## Task 2: 实现 Tauri 后端 - CLI 调用层
- [x] SubTask 2.1: 在 `src-tauri/src/` 中实现 `commands.rs`，封装 net-switch CLI 调用
- [x] SubTask 2.2: 实现 `get_profiles` 命令 - 调用 `net-switch list --format json`
- [x] SubTask 2.3: 实现 `get_current` 命令 - 调用 `net-switch current --format json`
- [x] SubTask 2.4: 实现 `switch_profile` 命令 - 调用 `net-switch use <profile>`
- [x] SubTask 2.5: 实现 `get_status` 命令 - 调用 `net-switch status --format json`
- [x] SubTask 2.6: 实现 `read_config` / `write_config` 命令 - 直接读写 YAML 配置文件
- [x] SubTask 2.7: 注册所有 Tauri commands

## Task 3: 实现前端 - 布局与路由
- [x] SubTask 3.1: 实现 `App.tsx` 主布局（侧边栏 + 主内容区）
- [x] SubTask 3.2: 实现侧边栏导航（概览、日志、设置）
- [x] SubTask 3.3: 配置 React Router 路由

## Task 4: 实现前端 - Profile 列表与切换
- [x] SubTask 4.1: 实现 `ProfileList` 组件 - 显示所有 Profile 卡片
- [x] SubTask 4.2: 实现 `ProfileCard` 组件 - 显示 Profile 信息和切换按钮
- [x] SubTask 4.3: 实现当前 Profile 高亮和状态指示器
- [x] SubTask 4.4: 实现切换操作（调用 Tauri command，显示进度）

## Task 5: 实现前端 - 状态面板
- [x] SubTask 5.1: 实现 `StatusPanel` 组件 - 显示当前代理、DNS、hosts 状态
- [x] SubTask 5.2: 实现颜色指示器组件

## Task 6: 实现前端 - 配置编辑器
- [x] SubTask 6.1: 实现 `ConfigEditor` 组件 - 表单化的 Profile 编辑
- [x] SubTask 6.2: 支持添加/删除 Profile
- [x] SubTask 6.3: 保存时调用 Tauri command 写入 config.yaml

## Task 7: 实现前端 - 日志查看
- [x] SubTask 7.1: 实现 `LogViewer` 组件 - 日志列表
- [x] SubTask 7.2: 支持按级别筛选

## Task 8: CLI 增加 JSON 输出支持
- [x] SubTask 8.1: 修改 `list.go` 支持 `--format json` 输出
- [x] SubTask 8.2: 修改 `current.go` 支持 `--format json` 输出
- [x] SubTask 8.3: 修改 `status.go` 支持 `--format json` 输出

## Task 9: Tauri 打包配置
- [x] SubTask 9.1: 配置 `tauri.conf.json` 的打包参数
- [x] SubTask 9.2: 配置应用图标
- [x] SubTask 9.3: 验证 `cargo build` 编译通过

# Task Dependencies
- Task 1 无依赖
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1
- Task 4 依赖 Task 2、Task 3
- Task 5 依赖 Task 2、Task 3
- Task 6 依赖 Task 2、Task 3
- Task 7 依赖 Task 2、Task 3
- Task 8 无依赖（可与 Task 1 并行）
- Task 9 依赖 Task 1-7

**可并行执行**：Task 1 + Task 8；Task 4/5/6/7 互相并行
