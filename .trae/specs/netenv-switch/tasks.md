# Tasks

## Phase 1: 项目初始化与基础框架

- [x] Task 1: 初始化 Go 项目与基础结构
  - [x] SubTask 1.1: 创建 `go.mod`，初始化模块路径 `github.com/netenv/netenv`
  - [x] SubTask 1.2: 创建完整目录结构（cmd/、internal/、pkg/、configs/、scripts/）
  - [x] SubTask 1.3: 创建 `Makefile`（build、test、lint、fmt 目标）
  - [x] SubTask 1.4: 创建 `.golangci.yml` 配置文件
  - [x] SubTask 1.5: 安装核心依赖（cobra、yaml.v3、color、tablewriter、zap、testify）

- [x] Task 2: 搭建 CLI 框架
  - [x] SubTask 2.1: 实现 `cmd/netenv/main.go` 程序入口
  - [x] SubTask 2.2: 实现 `cmd/netenv/root.go` 定义 root 命令及全局标志（--verbose、--dry-run、--no-color、--config）
  - [x] SubTask 2.3: 实现 `cmd/netenv/init.go` 命令（初始化 ~/.netenv/ 目录结构和默认配置）
  - [x] SubTask 2.4: 实现 `cmd/netenv/list.go` 命令（列出所有 Profile）
  - [x] SubTask 2.5: 实现 `cmd/netenv/current.go` 命令（显示当前激活 Profile）
  - [x] SubTask 2.6: 验证 `netenv --help`、`netenv init`、`netenv list`、`netenv current` 可正常运行

## Phase 2: 公共基础设施

- [x] Task 3: 实现日志模块
  - [x] SubTask 3.1: 实现 `pkg/logger/logger.go` 封装 zap 日志
  - [x] SubTask 3.2: 支持日志级别（debug、info、warn、error）
  - [x] SubTask 3.3: 支持彩色/无彩色输出切换
  - [ ] SubTask 3.4: 编写 logger 单元测试

- [x] Task 4: 实现错误类型模块
  - [x] SubTask 4.1: 实现 `pkg/errors/errors.go` 定义自定义错误类型
  - [x] SubTask 4.2: 定义 `ConfigError`、`PlatformError`、`NetworkError`、`PermissionError` 类型
  - [x] SubTask 4.3: 每种错误包含错误码、消息、建议操作

- [x] Task 5: 实现版本信息模块
  - [x] SubTask 5.1: 实现 `pkg/version/version.go`
  - [x] SubTask 5.2: 支持编译时注入版本号（ldflags）
  - [x] SubTask 5.3: 实现 `netenv version` 子命令

## Phase 3: 配置管理模块

- [x] Task 6: 定义 Profile 数据结构
  - [x] SubTask 6.1: 实现 `internal/config/profile.go` 定义完整的 Profile 结构体
  - [x] SubTask 6.2: 定义 ProxyConfig、DNSConfig、HostsConfig、EnvVarsConfig 子结构
  - [x] SubTask 6.3: 为所有结构添加 YAML 标签
  - [ ] SubTask 6.4: 编写 profile 结构体的序列化/反序列化测试

- [x] Task 7: 实现配置加载与合并
  - [x] SubTask 7.1: 实现 `internal/config/config.go` 的多层级配置加载逻辑
  - [x] SubTask 7.2: 实现全局配置（~/.netenv/config.yaml）加载
  - [x] SubTask 7.3: 实现 Profile 配置（~/.netenv/profiles/<name>.yaml）加载
  - [x] SubTask 7.4: 实现项目级配置（<project>/.netenv.yaml）加载
  - [x] SubTask 7.5: 实现配置合并逻辑（高优先级覆盖低优先级）
  - [x] SubTask 7.6: 实现 `internal/config/defaults.go` 内置默认值
  - [ ] SubTask 7.7: 编写配置加载和合并的完整测试用例

- [x] Task 8: 实现配置校验
  - [x] SubTask 8.1: 实现 `internal/config/validator.go` 配置校验引擎
  - [x] SubTask 8.2: 校验必填字段（Profile name）
  - [x] SubTask 8.3: 校验代理 URL 格式
  - [x] SubTask 8.4: 校验 IP 地址和 CIDR 格式
  - [x] SubTask 8.5: 校验 DNS 服务器地址格式
  - [ ] SubTask 8.6: 编写 validator 完整测试用例（正常和异常场景）

- [x] Task 9: 创建配置模板文件
  - [x] SubTask 9.1: 创建 `configs/templates/company.yaml` 公司内网模板
  - [x] SubTask 9.2: 创建 `configs/templates/vpn.yaml` VPN 环境模板
  - [x] SubTask 9.3: 创建 `configs/templates/test.yaml` 测试环境模板
  - [x] SubTask 9.4: 创建 `configs/templates/direct.yaml` 直连环境模板
  - [x] SubTask 9.5: 创建 `configs/config.example.yaml` 全局配置示例

## Phase 4: 平台适配层

- [x] Task 10: 定义平台适配接口
  - [x] SubTask 10.1: 实现 `internal/platform/adapter.go` 定义 `PlatformAdapter` 接口
  - [x] SubTask 10.2: 接口方法包括：SetProxy、SetDNS、SetEnvVars、GetEnvVars、FlushDNS、RequiresElevation、PlatformName
  - [x] SubTask 10.3: 实现 `internal/platform/factory.go` 平台适配器工厂

- [x] Task 11: 实现 Windows 平台适配器
  - [x] SubTask 11.1: 实现 `internal/platform/windows.go`
  - [x] SubTask 11.2: 实现代理设置（注册表写入 HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings）
  - [x] SubTask 11.3: 实现 DNS 设置（netsh 命令调用）
  - [x] SubTask 11.4: 实现环境变量设置（注册表 HKCU\Environment + setx）
  - [x] SubTask 11.5: 实现 DNS 缓存刷新（ipconfig /flushdns）
  - [x] SubTask 11.6: 实现权限提升检测
  - [ ] SubTask 11.7: 编写 Windows 适配器测试（需在 Windows 环境运行）

- [x] Task 12: 实现 macOS 平台适配器
  - [x] SubTask 12.1: 实现 `internal/platform/darwin.go`
  - [x] SubTask 12.2: 实现代理设置（networksetup 命令）
  - [x] SubTask 12.3: 实现 DNS 设置（networksetup 命令）
  - [x] SubTask 12.4: 实现环境变量设置（launchctl + shell profile）
  - [x] SubTask 12.5: 实现 DNS 缓存刷新（dscacheutil -flushcache）
  - [ ] SubTask 12.6: 编写 macOS 适配器测试

- [x] Task 13: 实现 Linux 平台适配器
  - [x] SubTask 13.1: 实现 `internal/platform/linux.go`
  - [x] SubTask 13.2: 实现代理设置（环境变量 + gsettings）
  - [x] SubTask 13.3: 实现 DNS 设置（resolvectl / /etc/resolv.conf）
  - [x] SubTask 13.4: 实现环境变量设置（/etc/environment + shell profile）
  - [x] SubTask 13.5: 实现 DNS 缓存刷新（resolvectl flush-caches）
  - [ ] SubTask 13.6: 编写 Linux 适配器测试

## Phase 5: 网络操作模块

- [x] Task 14: 实现 hosts 文件管理
  - [x] SubTask 14.1: 实现 `internal/network/hosts.go`
  - [x] SubTask 14.2: 实现 hosts 文件读取和解析
  - [x] SubTask 14.3: 实现标记区块（`# netenv:begin:<profile>` / `# netenv:end:<profile>`）插入
  - [x] SubTask 14.4: 实现标记区块清理（切换 Profile 时移除旧区块）
  - [x] SubTask 14.5: 实现文件锁机制防止并发修改
  - [x] SubTask 14.6: 支持 IPv4 和 IPv6 地址
  - [ ] SubTask 14.7: 编写 hosts 模块完整测试用例

- [x] Task 15: 实现代理配置逻辑
  - [x] SubTask 15.1: 实现 `internal/network/proxy.go`
  - [x] SubTask 15.2: 实现代理 URL 校验
  - [x] SubTask 15.3: 实现构建系统代理配置对象
  - [x] SubTask 15.4: 实现代理连通性检查（HTTP CONNECT 探测）
  - [x] SubTask 15.5: 实现 No Proxy 列表处理
  - [ ] SubTask 15.6: 编写 proxy 模块测试

- [x] Task 16: 实现 DNS 配置逻辑
  - [x] SubTask 16.1: 实现 `internal/network/dns.go`
  - [x] SubTask 16.2: 实现 DNS 配置对象构建
  - [x] SubTask 16.3: 实现 DNS 解析验证（使用新 DNS 解析测试域名）
  - [x] SubTask 16.4: 实现 Split DNS 配置处理
  - [ ] SubTask 16.5: 编写 dns 模块测试

- [x] Task 17: 实现环境变量管理
  - [x] SubTask 17.1: 实现 `internal/network/envvar.go`
  - [x] SubTask 17.2: 实现模板变量展开（支持 `${VAR}` 语法）
  - [x] SubTask 17.3: 实现环境变量设置/获取的平台无关逻辑
  - [ ] SubTask 17.4: 编写 envvar 模块测试

- [x] Task 18: 实现网络健康检查
  - [x] SubTask 18.1: 实现 `internal/network/health.go`
  - [x] SubTask 18.2: 实现代理连通性检查
  - [x] SubTask 18.3: 实现 DNS 解析检查
  - [x] SubTask 18.4: 实现 hosts 文件一致性检查
  - [x] SubTask 18.5: 实现环境变量检查
  - [x] SubTask 18.6: 实现诊断报告输出
  - [ ] SubTask 18.7: 编写 health 模块测试

## Phase 6: 状态管理模块

- [x] Task 19: 实现状态快照
  - [x] SubTask 19.1: 实现 `internal/state/snapshot.go` 定义快照数据结构
  - [x] SubTask 19.2: 实现从当前系统状态创建快照
  - [x] SubTask 19.3: 实现快照的序列化/反序列化（YAML 格式）

- [x] Task 20: 实现状态管理器
  - [x] SubTask 20.1: 实现 `internal/state/manager.go`
  - [x] SubTask 20.2: 实现快照保存到 `~/.netenv/state/` 目录
  - [x] SubTask 20.3: 实现快照加载
  - [x] SubTask 20.4: 实现历史记录管理（最大保留数量可配置）
  - [ ] SubTask 20.5: 实现 `internal/state/history.go` 历史记录查询
  - [ ] SubTask 20.6: 编写 state 模块完整测试

## Phase 7: 执行引擎

- [x] Task 21: 实现执行引擎核心
  - [x] SubTask 21.1: 实现 `internal/engine/engine.go` 切换引擎主逻辑
  - [x] SubTask 21.2: 实现完整切换流程编排：加载配置 → 校验 → 快照 → hosts → DNS → 代理 → 环境变量 → 健康检查 → 保存状态
  - [x] SubTask 21.3: 实现 `internal/engine/executor.go` 步骤执行器
  - [x] SubTask 21.4: 实现错误处理和自动回滚机制
  - [x] SubTask 21.5: 实现 `--dry-run` 模式（仅预览不执行）
  - [x] SubTask 21.6: 实现结果摘要输出
  - [ ] SubTask 21.7: 编写 engine 模块完整测试

## Phase 8: CLI 命令集成

- [x] Task 22: 实现核心 CLI 命令
  - [x] SubTask 22.1: 实现 `cmd/netenv/switch.go` 命令，集成 engine 执行切换
  - [x] SubTask 22.2: 实现 `cmd/netenv/rollback.go` 命令，调用 state manager 回滚
  - [x] SubTask 22.3: 实现 `cmd/netenv/validate.go` 命令，调用 validator 校验配置
  - [x] SubTask 22.4: 实现 `cmd/netenv/doctor.go` 命令，调用 health 模块诊断
  - [x] SubTask 22.5: 实现 `cmd/netenv/export.go` 命令
  - [x] SubTask 22.6: 实现 `cmd/netenv/import.go` 命令

## Phase 9: 插件系统框架

- [x] Task 23: 实现插件接口和注册机制
  - [x] SubTask 23.1: 实现 `internal/plugin/interface.go` 定义 Plugin 接口
  - [x] SubTask 23.2: 实现 `internal/plugin/registry.go` 插件注册表
  - [x] SubTask 23.3: 在 engine 中集成插件 Validate 和 Apply 钩子调用点
  - [x] SubTask 23.4: 实现 `cmd/netenv/plugin.go` plugin list 子命令
  - [ ] SubTask 23.5: 编写 plugin 模块测试

## Phase 10: 构建与发布

- [x] Task 24: 配置构建与发布流程
  - [x] SubTask 24.1: 编写 `scripts/build.sh` 跨平台构建脚本（支持 GOOS/GOARCH 矩阵）
  - [x] SubTask 24.2: 编写 `scripts/build.ps1` Windows 构建脚本
  - [x] SubTask 24.3: 配置 `.goreleaser.yml` 用于自动发布
  - [x] SubTask 24.4: 配置 Makefile 的 `build-all` 和 `release` 目标
  - [x] SubTask 24.5: 验证交叉编译（Windows/macOS/Linux，amd64/arm64）

# Task Dependencies

- Task 1（项目初始化）无依赖，可立即开始
- Task 2（CLI 框架）依赖 Task 1
- Task 3（日志模块）依赖 Task 1
- Task 4（错误类型）依赖 Task 1
- Task 5（版本信息）依赖 Task 1
- Task 6-9（配置管理）依赖 Task 1，可与 Task 2-5 并行
- Task 10-13（平台适配层）依赖 Task 1，可与 Task 6-9 并行
- Task 14-18（网络操作）依赖 Task 6（Profile 结构定义）和 Task 10（平台接口定义）
- Task 19-20（状态管理）依赖 Task 6
- Task 21（执行引擎）依赖 Task 14-18 和 Task 19-20
- Task 22（CLI 命令集成）依赖 Task 2、Task 21
- Task 23（插件系统）依赖 Task 6 和 Task 21
- Task 24（构建发布）依赖 Task 1，可与开发并行

**可并行执行的任务组**：
- 组 A：Task 2、3、4、5（基础框架和公共模块）
- 组 B：Task 6-9（配置管理）
- 组 C：Task 10-13（平台适配层）
- 组 D：Task 14-18（网络操作，内部有顺序依赖）
- 组 E：Task 19-20（状态管理）
