# 修复 6 个严重问题 Spec

## Why

自我评审发现了 6 个 🔴 严重问题，涵盖安全漏洞、架构断裂和并发缺陷。这些问题如果不修复，项目无法安全发布，核心功能也无法正常工作。

## What Changes

- **S1**: 修复 `IsEncrypted` 误判风险，增加多字段联合校验 + 魔数前缀
- **S2**: OAuth Token 增加 HMAC 完整性校验
- **S3**: 密码输入改用 `golang.org/x/term` 隐藏回显
- **A1**: 明确插件系统为"编译时注册"模式，Loader 增加 Manifest 注册能力
- **A2**: Plugin Registry 改为全局单例，init() 中注册所有内置插件
- **C1**: EventBus 增加 panic recovery、超时控制、错误收集

## Impact

- Affected specs: add-commercial-features（插件系统、加密、认证）
- Affected code:
  - `internal/crypto/container.go`
  - `internal/auth/token.go`
  - `cmd/net-switch/encrypt.go`
  - `internal/plugin/loader.go`, `registry.go`, `event.go`
  - `cmd/net-switch/root.go`

---

## ADDED Requirements

### Requirement: S1 - IsEncrypted 精确校验

系统 SHALL 通过以下方式识别加密容器：
1. YAML 中必须同时包含 `version`、`algorithm`、`kdf`、`salt`、`data` 五个字段
2. `kdf` 值必须是已知的 KDF 类型（pbkdf2 或 argon2id）
3. `algorithm` 值必须是 `aes-256-gcm`

#### Scenario: 普通配置文件不被误判
- **WHEN** 加载一个包含 `version: "1"` 的普通 config.yaml
- **THEN** `IsEncrypted` 返回 false

#### Scenario: 加密容器正确识别
- **WHEN** 加载一个包含 version/algorithm/kdf/salt/data 的加密文件
- **THEN** `IsEncrypted` 返回 true

### Requirement: S2 - OAuth Token HMAC 签名

系统 SHALL 对存储的 OAuth Token 进行 HMAC-SHA256 签名验证：
1. 存储时：计算 Token JSON 的 HMAC 签名，一并存入文件
2. 读取时：验证 HMAC 签名，签名不匹配则拒绝使用

#### Scenario: Token 完整性校验通过
- **WHEN** 读取未被篡改的 Token 文件
- **THEN** 验签通过，Token 正常使用

#### Scenario: Token 被篡改
- **WHEN** 读取被修改的 Token 文件
- **THEN** 验签失败，返回错误并清除 Token

### Requirement: S3 - 密码隐藏输入

系统 SHALL 使用终端原始模式读取密码，不在屏幕上回显。

#### Scenario: 用户输入密码
- **WHEN** 用户执行 `net-switch encrypt` 并输入密码
- **THEN** 终端不显示密码字符（显示 `***` 或空白）

### Requirement: A1 - 插件系统文档化 + Loader 增强

系统 SHALL 明确当前插件模式为"编译时注册"，并提供 `RegisterBuiltin` 便捷方法：
1. `Loader.RegisterBuiltin(name string, p Plugin)` 注册编译时插件
2. Manifest 从 Plugin.Manifest() 自动获取
3. README 和文档明确说明当前不支持运行时动态加载

#### Scenario: 注册内置插件
- **WHEN** 应用启动时调用 `loader.RegisterBuiltin("k8s", k8sPlugin)`
- **THEN** 插件出现在 Registry 中，可通过 `plugin list` 查看

### Requirement: A2 - Plugin Registry 全局单例

系统 SHALL 维护一个全局唯一的 Plugin Registry：
1. 使用 `sync.Once` 确保只初始化一次
2. 应用启动时在 `init()` 中注册所有内置插件（K8s、Echo）
3. 所有 CLI 命令共享同一个 Registry 实例

#### Scenario: plugin list 显示已注册插件
- **WHEN** 用户执行 `net-switch plugin list`
- **THEN** 显示 K8s 和 Echo 插件信息

### Requirement: C1 - EventBus 健壮性

系统 SHALL 增强 EventBus 的异步发布机制：
1. 每个 handler goroutine 增加 `recover()` 捕获 panic
2. 异步发布增加超时控制（默认 30 秒）
3. 异步发布返回 `[]error` 收集所有 handler 错误
4. 保持 `PublishSync` 同步语义不变

#### Scenario: handler panic 不影响其他 handler
- **WHEN** 某个 handler 触发 panic
- **THEN** panic 被 recover，其他 handler 正常执行，返回包含 panic 信息的 error

#### Scenario: handler 超时
- **WHEN** 某个 handler 超过 30 秒未完成
- **THEN** 返回超时错误，不阻塞调用方

---

## MODIFIED Requirements

无。

## REMOVED Requirements

无。
