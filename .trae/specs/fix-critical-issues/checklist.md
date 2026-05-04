# 修复 6 个严重问题 Checklist

## S1: IsEncrypted 精确校验
- [x] `IsEncrypted` 同时校验 version/algorithm/kdf/salt/data 五个字段
- [x] `algorithm` 值必须是 `aes-256-gcm`
- [x] `kdf` 值必须是 `pbkdf2` 或 `argon2id`
- [x] 普通 config.yaml（含 version 字段）不被误判为加密容器
- [x] 加密容器文件正确识别为加密
- [x] 相关测试通过（13 个 crypto 测试全部通过）

## S2: OAuth Token HMAC 签名
- [x] `SaveToken` 存储时计算 HMAC-SHA256 签名
- [x] `GetToken` 读取时验证 HMAC 签名
- [x] 签名不匹配时返回错误并清除 Token
- [x] HMAC key 与加密 key 独立派生（使用 `net-switch-token-hmac` 种子）
- [x] 编译通过

## S3: 密码隐藏输入
- [x] `golang.org/x/term` 依赖已添加
- [x] `readPassword` 使用 `term.ReadPassword` 替代 `bufio.NewReader`
- [x] 终端不显示密码字符（非终端回退 bufio）
- [x] 编译通过

## A1: 插件 Loader 增强
- [x] `RegisterBuiltin(name, plugin)` 方法存在于 Loader
- [x] `RegisterBuiltin` 自动从 `plugin.Manifest()` 获取 Manifest
- [x] 插件被正确注册到 Registry
- [x] 测试通过

## A2: Plugin Registry 全局单例
- [x] `internal/plugin/global.go` 存在且包含 `GetRegistry()`
- [x] 使用 `sync.Once` 确保只初始化一次
- [x] `cmd/net-switch/root.go` 的 `init()` 注册了 K8s 和 Echo 插件
- [x] `getPluginRegistry()` 已移除，统一使用 `plugin.GetRegistry()`
- [x] `net-switch plugin list` 能显示已注册的插件
- [x] 编译通过

## C1: EventBus 健壮性
- [x] 异步 `Publish` 中每个 handler 有 `recover()` 捕获
- [x] 异步 `Publish` 有超时控制（30 秒）
- [x] `Publish` 返回 `[]error` 收集错误
- [x] handler panic 被捕获，不影响其他 handler
- [x] handler 超时返回错误
- [x] 调用方适配新的返回值签名
- [x] 相关测试通过

## 全局验证
- [x] `go build ./...` 编译通过
- [x] `go vet ./...` 无警告
- [x] `go test ./...` 所有测试通过（crypto、plugin、k8s、rules、sync 全部通过）
- [x] 无循环依赖引入
