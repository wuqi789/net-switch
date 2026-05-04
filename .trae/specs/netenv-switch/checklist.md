# NetEnv Switch MVP Checklist

## 1. 项目结构验证

- [x] `cmd/netenv/` 目录包含 main.go、root.go、init.go、list.go、current.go
- [x] `internal/config/` 包含 profile.go、config.go、defaults.go、validator.go
- [x] `internal/network/` 包含 hosts.go、proxy.go、dns.go、envvar.go、health.go
- [x] `internal/platform/` 包含 adapter.go、factory.go、windows.go、darwin.go、linux.go
- [x] `internal/state/` 包含 snapshot.go、manager.go
- [x] `internal/plugin/` 包含 interface.go、registry.go
- [x] `internal/engine/` 包含 engine.go、executor.go
- [x] `pkg/version/`、`pkg/logger/`、`pkg/errors/` 目录存在
- [x] `configs/templates/` 包含示例配置文件
- [x] `scripts/` 包含构建脚本
- [x] `go.mod` 模块路径为 `github.com/netenv/netenv`
- [x] `Makefile` 包含 build、test、lint、fmt 目标

## 2. CLI 基础功能验证

- [x] `netenv --help` 显示帮助信息，列出所有可用命令
- [x] `netenv init` 创建 `~/.netenv/` 目录结构
- [x] `netenv init` 生成默认 `~/.netenv/config.yaml`
- [x] `netenv list` 列出所有 Profile（或显示"无 Profile"）
- [x] `netenv current` 显示当前激活 Profile（或显示"无激活 Profile"）
- [x] `netenv version` 显示版本信息
- [x] 全局标志 `--verbose`、`--dry-run`、`--no-color`、--config` 可解析

## 3. 配置管理验证

- [x] Profile 数据结构包含 proxy、dns、hosts、env_vars 所有字段
- [x] 配置加载支持 YAML 格式
- [x] 配置合并逻辑正确（overlay 覆盖 base）
- [x] 配置校验器可检测无效配置并输出错误信息
- [x] 配置模板文件格式正确、可加载

## 4. 平台适配层验证

- [x] `PlatformAdapter` 接口定义完整（SetProxy、ClearProxy、SetDNS、ClearDNS、SetEnvVars、GetEnvVars、FlushDNS、RequiresElevation、PlatformName）
- [x] `NewAdapter()` 根据 `runtime.GOOS` 返回正确适配器
- [x] Windows 适配器可操作注册表（代理设置）
- [x] Windows 适配器可调用 netsh（DNS 设置）
- [x] Windows 适配器可调用 ipconfig /flushdns

## 5. 网络操作验证

- [x] Hosts 文件可读写，支持标记区块插入和移除
- [x] 代理 URL 可校验
- [x] DNS 服务器地址可校验
- [x] 环境变量模板展开支持 `${VAR}` 语法

## 6. 状态管理验证

- [x] 状态快照可序列化为 YAML
- [x] 快照可保存到 `~/.netenv/state/` 目录
- [x] 最新快照可加载
- [x] 历史记录管理（最大保留数量）

## 7. 执行引擎验证

- [x] 切换流程编排正确（hosts → DNS → 代理 → 环境变量）
- [x] `--dry-run` 模式不实际执行操作
- [x] 切换失败时自动回滚

## 8. 构建验证

- [x] `go build ./...` 编译成功
- [x] `go vet ./...` 无错误
- [ ] `go test ./...` 所有测试通过（待编写测试）
- [x] Makefile 目标可执行
- [x] `.goreleaser.yml` 格式正确
