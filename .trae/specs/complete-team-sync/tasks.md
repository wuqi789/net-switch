# Tasks

## Task 1: 扩展 Config 结构体支持 team-sync 解析
- [x] SubTask 1.1: 在 `internal/config/config.go` 的 `Config` 结构体中添加 `TeamSync` 字段（指向 `sync.TeamConfig`）
- [x] SubTask 1.2: 导入 `internal/sync` 包引用 `TeamConfig` 类型
- [x] SubTask 1.3: 验证 `LoadConfig` 能正确解析包含 `team-sync` 段的 config.yaml

## Task 2: 实现 CLI createSyncClient 从配置读取
- [x] SubTask 2.1: 修改 `cmd/net-switch/sync.go` 的 `createSyncClient()` 函数
- [x] SubTask 2.2: 从 `config.LoadConfig()` 读取 `TeamSync` 配置
- [x] SubTask 2.3: 当 `TeamSync` 为 nil 或 `ServerURL` 为空时返回 nil（保持向后兼容）
- [x] SubTask 2.4: 使用 `sync.NewClient(serverURL, teamID, token)` 构建真实 Client

## Task 3: 实现 CLI sync status 真实状态返回
- [x] SubTask 3.1: 重写 `newSyncStatusCmd()` 的 `RunE` 函数
- [x] SubTask 3.2: 从 config 读取 TeamSync 配置
- [x] SubTask 3.3: JSON 输出时包含 `configured`、`team_id`、`team_name`、`server_url`、`conflict_mode`、`auto_pull`、`status` 字段
- [x] SubTask 3.4: 非 JSON 输出时显示格式化的同步状态信息

## Task 4: GUI Rust 后端新增 Tauri 命令
- [x] SubTask 4.1: 新增 `sync_status` 命令 — 调用 `net-switch sync status --format json` 返回状态
- [x] SubTask 4.2: 新增 `get_sync_config` 命令 — 读取 config.yaml 中 team-sync 段返回 JSON
- [x] SubTask 4.3: 新增 `save_sync_config` 命令 — 将 team-sync 配置写入 config.yaml
- [x] SubTask 4.4: 修改 `sync_pull` 和 `sync_push` 正确返回错误而非忽略
- [x] SubTask 4.5: 注册所有新 Tauri 命令到 invoke_handler

## Task 5: GUI 前端 SyncPanel 重构
- [x] SubTask 5.1: 添加同步配置表单（服务器地址、团队 ID、认证 Token、团队名称）
- [x] SubTask 5.2: 修复 `loadStatus` 使用 `sync_status` 而非 `sync_pull`
- [x] SubTask 5.3: 实现配置保存（调用 save_sync_config）
- [x] SubTask 5.4: 实现自动拉取开关持久化（调用 save_sync_config）
- [x] SubTask 5.5: 实现冲突解决方式持久化（调用 save_sync_config）
- [x] SubTask 5.6: Pull/Push 操作显示成功/失败反馈
- [x] SubTask 5.7: 未配置时显示配置引导而非空面板

## Task 6: 类型定义更新
- [x] SubTask 6.1: 在 `types/index.ts` 中新增 `SyncConfigData` 接口（团队同步配置数据结构）

# Task Dependencies
- Task 1 无依赖
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1
- Task 4 依赖 Task 3（需要 CLI 返回正确 JSON）
- Task 5 依赖 Task 4（需要 Tauri 命令可用）
- Task 6 无依赖（可并行）

**可并行执行**：Task 1 + Task 6；Task 2 + Task 3（在 Task 1 完成后）
