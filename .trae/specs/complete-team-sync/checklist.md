# 验证清单

- [x] config.yaml 包含 `team-sync` 段时，`LoadConfig` 正确解析到 `TeamSync` 字段
- [x] config.yaml 不包含 `team-sync` 段时，`TeamSync` 为 nil，已有功能不受影响
- [x] CLI `net-switch sync status --format json` 已配置时返回 `configured: true` 及完整配置信息
- [x] CLI `net-switch sync status --format json` 未配置时返回 `configured: false` 及友好提示
- [x] CLI `net-switch sync pull` 使用 config 中的 conflict_mode 进行合并
- [x] CLI `net-switch sync push` 使用真实的 sync.Client 推送
- [x] GUI `sync_status` Tauri 命令正确返回同步状态 JSON
- [x] GUI `get_sync_config` Tauri 命令正确返回 team-sync 配置 JSON
- [x] GUI `save_sync_config` Tauri 命令正确写入 team-sync 配置到 config.yaml
- [x] GUI SyncPanel 未配置时显示配置表单（服务器地址、团队 ID、Token、团队名称）
- [x] GUI SyncPanel 已配置时显示团队信息卡片、同步状态、操作按钮
- [x] GUI 同步配置表单保存后，页面刷新显示已配置状态
- [x] GUI 拉取/推送操作显示成功或失败的明确反馈
- [x] GUI 自动拉取开关切换后持久化到 config.yaml
- [x] GUI 冲突解决方式切换后持久化到 config.yaml
- [x] GUI 加载状态使用 `sync_status` 而非 `sync_pull`（不触发实际网络请求）
