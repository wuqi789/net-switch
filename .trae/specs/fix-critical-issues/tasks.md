# Tasks

## Phase 1: 安全修复（S1 + S3）

- [x] Task 1: 修复 IsEncrypted 误判风险（S1）
  - [x] SubTask 1.1: 修改 `internal/crypto/container.go` 的 `IsEncrypted` 函数，增加 `kdf`、`salt`、`data` 字段联合校验
  - [x] SubTask 1.2: 验证 `algorithm` 值必须是 `aes-256-gcm`，`kdf` 值必须是 `pbkdf2` 或 `argon2id`
  - [x] SubTask 1.3: 编写测试：普通 config.yaml 不被误判、加密容器正确识别
  - [x] SubTask 1.4: 运行 `go test ./internal/crypto/... -v` 验证

- [x] Task 2: 修复密码终端明文回显（S3）
  - [x] SubTask 2.1: 添加 `golang.org/x/term` 依赖
  - [x] SubTask 2.2: 修改 `cmd/net-switch/encrypt.go` 的 `readPassword` 函数，使用 `term.ReadPassword`
  - [x] SubTask 2.3: 运行 `go build ./...` 验证编译通过

## Phase 2: 架构修复（A1 + A2）

- [x] Task 3: 修复 Plugin Registry 全局单例（A2）
  - [x] SubTask 3.1: 创建 `internal/plugin/global.go`，实现全局 Registry 单例（sync.Once）
  - [x] SubTask 3.2: 实现 `GetRegistry()` 函数返回全局实例
  - [x] SubTask 3.3: 修改 `cmd/net-switch/root.go`，`init()` 中注册 K8s 和 Echo 插件到全局 Registry
  - [x] SubTask 3.4: 修改 `getPluginRegistry()` 使用全局实例
  - [x] SubTask 3.5: 运行 `go build ./...` 验证

- [x] Task 4: 增强插件 Loader（A1）
  - [x] SubTask 4.1: 修改 `internal/plugin/loader.go`，新增 `RegisterBuiltin(name string, p Plugin)` 方法
  - [x] SubTask 4.2: `RegisterBuiltin` 自动从 `p.Manifest()` 获取 Manifest 并注册到 Registry
  - [x] SubTask 4.3: 运行 `go test ./internal/plugin/... -v` 验证

## Phase 3: Token 安全（S2）

- [x] Task 5: OAuth Token HMAC 签名（S2）
  - [x] SubTask 5.1: 修改 `internal/auth/token.go` 的 `SaveToken`，存储时附加 HMAC-SHA256 签名
  - [x] SubTask 5.2: 修改 `GetToken`，读取时验证 HMAC 签名
  - [x] SubTask 5.3: 签名验证失败时清除 Token 并返回错误
  - [x] SubTask 5.4: 运行 `go build ./...` 验证

## Phase 4: 并发安全（C1）

- [x] Task 6: EventBus 异步发布增强（C1）
  - [x] SubTask 6.1: 修改 `internal/plugin/event.go` 的 `Publish` 方法，增加 `recover()` 捕获
  - [x] SubTask 6.2: 增加超时控制（默认 30 秒 context）
  - [x] SubTask 6.3: `Publish` 返回 `[]error` 收集所有 handler 错误
  - [x] SubTask 6.4: 修改调用方适配新的返回值签名
  - [x] SubTask 6.5: 更新 EventBus 测试用例（panic recovery、超时、错误收集）
  - [x] SubTask 6.6: 运行 `go test ./internal/plugin/... -v` 验证

## Phase 5: 全局验证

- [x] Task 7: 全项目构建和测试验证
  - [x] SubTask 7.1: 运行 `go build ./...` 确认编译通过
  - [x] SubTask 7.2: 运行 `go vet ./...` 确认无静态分析警告
  - [x] SubTask 7.3: 运行 `go test ./...` 确认所有测试通过
  - [x] SubTask 7.4: 更新 tasks.md 和 checklist.md

# Task Dependencies

- Task 1、Task 2 可并行（安全修复，无依赖）
- Task 3 依赖 Task 4（Loader 增强后才能注册内置插件）
- Task 5 独立（Token 安全，无依赖）
- Task 6 独立（EventBus 增强，无依赖）
- Task 7 依赖所有前置任务

**可并行执行**：
- Phase 1（Task 1 + Task 2）+ Task 5 + Task 6 可全部并行
- Task 3 + Task 4 串行（先 Loader 后 Registry）
