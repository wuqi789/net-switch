# Tasks

## Phase 1: 插件系统基础

- [x] Task 1.1: 定义插件接口和数据结构
  - [x] SubTask 1.1.1: 创建 `internal/plugin/interface.go`，定义 Plugin、Manifest、PluginContext、ExecutionContext 接口
  - [x] SubTask 1.1.2: 创建 `internal/plugin/event.go`，实现 EventBus 事件总线
  - [x] SubTask 1.1.3: 创建 `internal/plugin/command.go`，实现 CLI 命令注册器

- [x] Task 1.2: 实现插件注册表和加载器
  - [x] SubTask 1.2.1: 创建 `internal/plugin/registry.go`，实现插件注册、查询、启用/禁用
  - [x] SubTask 1.2.2: 创建 `internal/plugin/loader.go`，实现从目录扫描和加载插件（Go plugin 模式）
  - [x] SubTask 1.2.3: 创建 `internal/plugin/dependency.go`，实现依赖关系解析（DAG 排序）

- [x] Task 1.3: 集成插件系统到主流程
  - [x] SubTask 1.3.1: 修改 `config.yaml` 格式，增加 `plugins` 配置段
  - [x] SubTask 1.3.2: 修改 Engine，在切换流程中调用插件钩子
  - [x] SubTask 1.3.3: 新增 CLI 命令 `net-switch plugin list` / `net-switch plugin info <name>`
  - [x] SubTask 1.3.4: 创建示例插件 `echo-plugin` 验证加载流程

- [x] Task 1.4: 插件单元测试
  - [x] SubTask 1.4.1: 编写 EventBus 单元测试
  - [x] SubTask 1.4.2: 编写 Registry 单元测试
  - [x] SubTask 1.4.3: 编写 Loader 单元测试
  - [x] SubTask 1.4.4: 编写 echo-plugin 集成测试

## Phase 2: 配置加密

- [x] Task 2.1: 实现加密核心模块
  - [x] SubTask 2.1.1: 创建 `internal/crypto/aes.go`，实现 AES-256-GCM 加密/解密
  - [x] SubTask 2.1.2: 创建 `internal/crypto/kdf.go`，实现 Argon2id 和 PBKDF2 密钥派生
  - [x] SubTask 2.1.3: 创建 `internal/crypto/container.go`，实现 EncryptedContainer 数据结构
  - [x] SubTask 2.1.4: 创建 `internal/crypto/field.go`，实现字段级加密标记 `${encrypted:...}`

- [x] Task 2.2: 集成加密到配置加载链
  - [x] SubTask 2.2.1: 修改 `config.go` 的 LoadConfig，支持自动检测加密格式并解密
  - [x] SubTask 2.2.2: 新增 SaveConfig 加密选项，支持写入加密文件
  - [x] SubTask 2.2.3: 实现敏感字段自动加密（基于 pattern 匹配）

- [x] Task 2.3: CLI 命令扩展
  - [x] SubTask 2.3.1: 新增 `net-switch encrypt` 命令（加密配置文件）
  - [x] SubTask 2.3.2: 新增 `net-switch decrypt` 命令（解密配置文件）
  - [x] SubTask 2.3.3: 新增 `net-switch key set` 命令（设置/修改主密钥口令）

- [x] Task 2.4: 加密模块测试
  - [x] SubTask 2.4.1: 编写 AES-256-GCM 加密/解密单元测试
  - [x] SubTask 2.4.2: 编写密钥派生单元测试
  - [x] SubTask 2.4.3: 编写字段级加密端到端测试

## Phase 3: 自动规则引擎

- [x] Task 3.1: 规则引擎核心
  - [x] SubTask 3.1.1: 创建 `internal/rules/rule.go`，定义 RuleSet/Rule/Trigger/Action 数据结构
  - [x] SubTask 3.1.2: 创建 `internal/rules/engine.go`，实现规则匹配引擎
  - [x] SubTask 3.1.3: 创建 `internal/rules/trigger.go`，实现各触发器（domain/ip/ssid/process）
  - [x] SubTask 3.1.4: 创建 `internal/rules/cooldown.go`，实现触发冷却机制

- [x] Task 3.2: 网络事件监听
  - [x] SubTask 3.2.1: 创建 `internal/rules/watcher_wifi.go`，实现 WiFi SSID 监听（跨平台）
  - [x] SubTask 3.2.2: 创建 `internal/rules/watcher_dns.go`，实现域名查询日志分析（可选）
  - [x] SubTask 3.2.3: 创建 `internal/rules/watcher_network.go`，实现网络接口状态变化监听

- [x] Task 3.3: CLI 命令扩展
  - [x] SubTask 3.3.1: 新增 `net-switch rules list` 命令
  - [x] SubTask 3.3.2: 新增 `net-switch rules test <domain>` 命令（测试规则匹配）
  - [x] SubTask 3.3.3: 新增 `net-switch rules enable/disable <name>` 命令

- [x] Task 3.4: 规则引擎测试
  - [x] SubTask 3.4.1: 编写域名匹配单元测试（glob/regex/cidr）
  - [x] SubTask 3.4.2: 编写规则优先级和冷却测试
  - [x] SubTask 3.4.3: 编写 WiFi SSID 监听集成测试

## Phase 4: Kubernetes 插件

- [x] Task 4.1: K8s 插件实现
  - [x] SubTask 4.1.1: 创建 `internal/plugins/k8s/plugin.go`，实现 Plugin 接口
  - [x] SubTask 4.1.2: 创建 `internal/plugins/k8s/kubeconfig.go`，实现 kubeconfig 解析和切换
  - [x] SubTask 4.1.3: 创建 `internal/plugins/k8s/context.go`，实现 context 列表/切换/当前
  - [x] SubTask 4.1.4: 创建 `internal/plugins/k8s/namespace.go`，实现 namespace 切换

- [x] Task 4.2: CLI 子命令注册
  - [x] SubTask 4.2.1: 注册 `net-switch k8s list` / `net-switch k8s current` / `net-switch k8s switch`
  - [x] SubTask 4.2.2: 注册 `net-switch k8s ns <namespace>`
  - [x] SubTask 4.2.3: Profile 切换时自动应用 K8s context 映射

- [ ] Task 4.3: K8s 插件测试
  - [ ] SubTask 4.3.1: 编写 kubeconfig 解析单元测试
  - [ ] SubTask 4.3.2: 编写 context 切换集成测试

## Phase 5: 团队同步 + 登录系统

- [x] Task 5.1: 同步协议实现
  - [x] SubTask 5.1.1: 创建 `internal/sync/client.go`，实现 HTTP 客户端（拉取/推送/增量）
  - [x] SubTask 5.1.2: 创建 `internal/sync/merge.go`，实现配置合并与冲突解决策略
  - [x] SubTask 5.1.3: 创建 `internal/sync/signature.go`，实现配置签名验证
  - [x] SubTask 5.1.4: 创建 `internal/sync/manager.go`，实现同步管理器（定时拉取/推送）

- [ ] Task 5.2: 登录系统
  - [ ] SubTask 5.2.1: 创建 `internal/auth/oauth.go`，实现 OAuth2 授权码流程
  - [ ] SubTask 5.2.2: 创建 `internal/auth/keychain.go`，实现 OS Keychain 集成
  - [ ] SubTask 5.2.3: 创建 `internal/auth/token.go`，实现 Token 存储和刷新

- [x] Task 5.3: CLI 命令扩展
  - [x] SubTask 5.3.1: 新增 `net-switch sync pull` / `net-switch sync push` 命令
  - [x] SubTask 5.3.2: 新增 `net-switch auth login` / `net-switch auth logout` 命令
  - [x] SubTask 5.3.3: 新增 `net-switch team info` 命令

- [ ] Task 5.4: 同步模块测试
  - [ ] SubTask 5.4.1: 编写配置合并单元测试
  - [ ] SubTask 5.4.2: 编写冲突解决单元测试
  - [ ] SubTask 5.4.3: 编写签名验证单元测试

## Phase 6: 商业授权系统

- [x] Task 6.1: License 模块
  - [x] SubTask 6.1.1: 创建 `internal/license/license.go`，实现 License 数据结构和解析
  - [x] SubTask 6.1.2: 创建 `internal/license/fingerprint.go`，实现设备指纹生成
  - [x] SubTask 6.1.3: 创建 `internal/license/validator.go`，实现在线/离线验证
  - [x] SubTask 6.1.4: 创建 `internal/license/features.go`，实现功能开关系统

- [ ] Task 6.2: GUI 商业功能入口
  - [ ] SubTask 6.2.1: GUI 新增 License 激活页面
  - [ ] SubTask 6.2.2: GUI 新增团队同步配置页面
  - [ ] SubTask 6.2.3: GUI 新增规则编辑器页面
  - [ ] SubTask 6.2.4: GUI 新增插件管理页面

## Phase 7: GUI 集成

- [x] Task 7.1: GUI 团队功能
  - [x] SubTask 7.1.1: 新增 `SyncPanel` 组件 - 团队配置同步界面
  - [x] SubTask 7.1.2: 新增 `RuleEditor` 组件 - 自动规则可视化编辑
  - [x] SubTask 7.1.3: 新增 `PluginManager` 组件 - 插件列表与管理

- [x] Task 7.2: GUI 安全功能
  - [x] SubTask 7.2.1: 新增 `EncryptConfig` 组件 - 加密配置管理界面
  - [x] SubTask 7.2.2: 新增 `LicenseActivation` 组件 - 授权激活页面

# Task Dependencies

- Task 1.1 → Task 1.2 → Task 1.3 → Task 1.4
- Task 2.1 → Task 2.2 → Task 2.3 → Task 2.4
- Task 3.1 → Task 3.2 → Task 3.3 → Task 3.4
- Task 1.1 → Task 4.1（K8s 插件依赖插件接口）
- Task 2.1 → Task 5.2（登录系统 Token 加密依赖加密模块）
- Task 5.1 → Task 5.3 → Task 5.4
- Task 6.1 独立（可与 Phase 1-5 并行）
- Task 7.1 依赖 Task 5.1（GUI 同步依赖后端同步模块）
- Task 7.2 依赖 Task 2.1 + Task 6.1

**可并行执行**：
- Phase 1（插件系统）和 Phase 2（加密）可并行
- Phase 3（规则引擎）和 Phase 4（K8s 插件）可并行
- Phase 6（授权系统）可与 Phase 3-5 并行
