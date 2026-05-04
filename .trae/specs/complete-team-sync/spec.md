# 完善团队同步功能 Spec

## Why
团队同步的核心库（`internal/sync`）已完整实现（Client、Manager、MergeProfiles 等），但 CLI 层和 GUI 层均未正确对接。CLI 的 `createSyncClient()` 始终返回 `nil`，`sync status` 始终返回 "not configured"；GUI 的 SyncPanel 存在多个功能缺陷：加载状态时误触发 pull、设置项不持久化、无法配置同步服务器。需要打通从配置解析到 CLI 命令到 GUI 界面的完整链路。

## What Changes
- Config 结构体增加 `TeamSync` 字段，解析 `team-sync` 配置段
- CLI `createSyncClient()` 从 config 中读取 team-sync 配置构建真实 Client
- CLI `sync status` 返回真实的同步配置状态
- GUI Rust 后端新增 `sync_status`、`get_sync_config`、`save_sync_config` Tauri 命令
- GUI SyncPanel 重构：增加同步配置表单、修复状态加载逻辑、持久化设置项
- `sync_pull` / `sync_push` 命令正确传递错误信息

## Impact
- Affected specs: GUI Desktop App (add-gui-desktop-app)
- Affected code:
  - `internal/config/config.go` — Config 结构体扩展
  - `cmd/net-switch/sync.go` — CLI 命令实现
  - `net-switch-gui/src-tauri/src/lib.rs` — Tauri 命令注册
  - `net-switch-gui/src/components/SyncPanel.tsx` — 前端面板
  - `net-switch-gui/src/types/index.ts` — TypeScript 类型

## ADDED Requirements

### Requirement: Config 解析 team-sync 段
系统 SHALL 在加载 config.yaml 时解析 `team-sync` 配置段。

#### Scenario: config.yaml 包含 team-sync
- **WHEN** config.yaml 中存在 `team-sync` 段
- **THEN** `Config.TeamSync` 字段包含完整的 TeamConfig 数据

#### Scenario: config.yaml 不包含 team-sync
- **WHEN** config.yaml 中不存在 `team-sync` 段
- **THEN** `Config.TeamSync` 为 nil，不影响已有功能

### Requirement: CLI createSyncClient 从配置构建
系统 SHALL 根据 config 中的 team-sync 配置创建真实的 sync.Client。

#### Scenario: team-sync 已配置
- **WHEN** config 中存在 team-sync 且包含 server_url、team_id、token
- **THEN** `createSyncClient()` 返回可用的 `*sync.Client`

#### Scenario: team-sync 未配置
- **WHEN** config 中不存在 team-sync 配置
- **THEN** `createSyncClient()` 返回 nil，命令输出 "sync not configured" 提示

### Requirement: CLI sync status 返回真实状态
系统 SHALL 在 `sync status --format json` 时返回真实的同步配置和状态。

#### Scenario: 已配置 team-sync
- **WHEN** 执行 `net-switch sync status --format json` 且 team-sync 已配置
- **THEN** 返回 JSON 包含 `configured: true`、`team_id`、`team_name`、`server_url`、`conflict_mode`、`auto_pull` 等字段

#### Scenario: 未配置 team-sync
- **WHEN** 执行 `net-switch sync status --format json` 且 team-sync 未配置
- **THEN** 返回 JSON 包含 `configured: false`、`status: "not_configured"`、`error` 提示信息

### Requirement: GUI 同步配置表单
GUI SHALL 提供团队同步配置的表单界面。

#### Scenario: 未配置时显示配置入口
- **WHEN** 用户进入团队同步页面且未配置 team-sync
- **THEN** 显示配置表单（服务器地址、团队 ID、认证 Token、团队名称）

#### Scenario: 保存配置
- **WHEN** 用户填写配置并点击保存
- **THEN** 配置写入 config.yaml 的 `team-sync` 段，页面刷新显示已配置状态

### Requirement: GUI 状态加载修复
GUI SHALL 使用独立的 status 命令获取同步状态，而非 pull。

#### Scenario: 加载同步状态
- **WHEN** 用户进入团队同步页面或点击刷新
- **THEN** 调用 `sync_status` 命令获取状态（不触发实际网络请求）

### Requirement: GUI 设置持久化
GUI SHALL 将冲突解决方式和自动拉取设置持久化到 config.yaml。

#### Scenario: 切换自动拉取
- **WHEN** 用户切换自动拉取开关
- **THEN** 更新 config.yaml 中 team-sync.sync.auto_pull 字段

#### Scenario: 切换冲突模式
- **WHEN** 用户选择不同冲突解决方式
- **THEN** 更新 config.yaml 中 team-sync.sync.conflict_mode 字段

### Requirement: GUI Pull/Push 反馈
GUI SHALL 在拉取/推送操作后提供明确的成功或失败反馈。

#### Scenario: 拉取成功
- **WHEN** 用户点击拉取且操作成功
- **THEN** 显示成功提示并刷新状态

#### Scenario: 拉取失败
- **WHEN** 用户点击拉取且操作失败
- **THEN** 显示具体错误信息

## MODIFIED Requirements
（无修改已有 requirement，均为新增）

## REMOVED Requirements
（无移除）
