# NetEnv Switch - 开发者网络环境切换工具 规格文档

## Why

开发者在日常工作中需要频繁切换不同的网络环境（公司内网、VPN、测试环境、生产环境等），每次切换都需要手动修改代理设置、DNS 配置、hosts 文件和环境变量，过程繁琐且容易出错。现有的工具如 CC-Switch 存在平台限制、配置不灵活、缺乏可扩展性等问题。

NetEnv Switch 旨在提供一个现代化、跨平台、可扩展的一键网络环境切换工具，以 CLI 为核心，支持 YAML 配置，未来可扩展 GUI 和 Kubernetes/云环境支持。

## What Changes

- 新建完整的 Go 项目工程结构
- 实现核心 CLI 框架（基于 Cobra）
- 实现配置管理模块（YAML 解析、Profile 管理）
- 实现网络操作模块（代理、DNS、hosts、环境变量切换）
- 实现平台适配层（Windows、macOS、Linux）
- 实现插件化扩展框架（为未来 K8s/云环境预留）
- 实现状态管理与回滚机制
- 实现健康检查与配置验证

## Impact

- Affected specs: 全新项目，无已有规格影响
- Affected code: 全新代码库

## ADDED Requirements

### Requirement: CLI 核心框架

系统 SHALL 提供基于 Cobra 的 CLI 框架，支持以下顶级命令：

- `netenv switch <profile>` - 切换到指定网络配置方案
- `netenv list` - 列出所有可用的配置方案
- `netenv current` - 显示当前激活的配置方案
- `netenv init` - 初始化配置文件和目录结构
- `netenv validate <profile>` - 验证配置方案的合法性
- `netenv rollback` - 回滚到上一个配置状态
- `netenv export <profile>` - 导出配置方案
- `netenv import <file>` - 导入配置方案
- `netenv plugin list` - 列出已安装的插件
- `netenv doctor` - 诊断当前网络环境状态

#### Scenario: 切换网络配置

- **WHEN** 用户执行 `netenv switch company`
- **THEN** 系统读取 `company` 配置方案，依次应用代理设置、DNS 配置、hosts 文件修改、环境变量设置
- **AND** 系统在操作前自动备份当前状态
- **AND** 系统输出切换结果摘要

#### Scenario: 回滚配置

- **WHEN** 用户执行 `netenv rollback`
- **THEN** 系统恢复到上一次切换前的网络配置状态
- **AND** 系统输出回滚结果

### Requirement: 配置管理

系统 SHALL 使用 YAML 格式的配置文件，支持以下配置层级：

1. 全局配置：`~/.netenv/config.yaml`（用户级默认值）
2. Profile 配置：`~/.netenv/profiles/<name>.yaml`（各环境方案）
3. 项目级配置：`<project>/.netenv.yaml`（项目覆盖值，优先级最高）

#### Scenario: 加载配置

- **WHEN** 系统启动
- **THEN** 系统按优先级加载配置：项目级 > Profile > 全局
- **AND** 同名字段高优先级覆盖低优先级
- **AND** 配置文件不存在时使用内置默认值

#### Scenario: 配置校验

- **WHEN** 用户执行 `netenv validate company`
- **THEN** 系统检查 YAML 语法合法性
- **AND** 系统检查必填字段完整性
- **AND** 系统检查字段值类型和范围
- **AND** 系统输出校验结果和错误详情

### Requirement: 代理配置管理

系统 SHALL 支持以下代理类型配置：

- HTTP 代理
- HTTPS 代理
- SOCKS5 代理
- PAC 代理
- No Proxy 列表（排除域名/IP）

#### Scenario: 应用 HTTP 代理

- **WHEN** Profile 中配置了 HTTP 代理
- **THEN** 系统设置系统级 HTTP_PROXY / HTTPS_PROXY 环境变量
- **AND** 系统设置系统代理设置（通过平台适配层）
- **AND** 系统验证代理连通性

### Requirement: DNS 配置管理

系统 SHALL 支持以下 DNS 配置：

- 自定义 DNS 服务器列表
- DNS 搜索域
- 特定域名的 DNS 路由（Split DNS）

#### Scenario: 应用 DNS 配置

- **WHEN** Profile 中配置了 DNS 服务器
- **THEN** 系统通过平台适配层修改系统 DNS 设置
- **AND** 系统配置 DNS 搜索域（如配置）
- **AND** 系统验证 DNS 解析功能

### Requirement: Hosts 文件管理

系统 SHALL 支持 hosts 文件的以下操作：

- 添加/修改/删除 hosts 条目
- 以注释块形式管理（便于识别和回滚）
- 支持 IPv4 和 IPv6 地址

#### Scenario: 应用 hosts 条目

- **WHEN** Profile 中配置了 hosts 条目
- **THEN** 系统在 hosts 文件中添加/更新由 `# netenv:begin:<profile>` 和 `# netenv:end:<profile>` 标记的区块
- **AND** 切换到其他 Profile 时，清理前一个 Profile 的标记区块
- **AND** 需要管理员/root 权限时提示用户

### Requirement: 环境变量管理

系统 SHALL 支持环境变量的以下操作：

- 设置/删除环境变量
- 支持系统级和用户级环境变量
- 支持变量值的模板语法（如 `${HOME}/proxy`）

#### Scenario: 应用环境变量

- **WHEN** Profile 中配置了环境变量
- **THEN** 系统设置指定的环境变量到目标作用域
- **AND** 系统支持模板变量展开
- **AND** 变量变更对新启动的终端进程生效

### Requirement: 平台适配层

系统 SHALL 通过平台适配层（Platform Adapter）隔离操作系统差异，支持：

- Windows（10/11）
- macOS（12+）
- Linux（主流发行版）

每个平台适配器 SHALL 实现统一的 `PlatformAdapter` 接口：

```
type PlatformAdapter interface {
    SetProxy(config ProxyConfig) error
    SetDNS(config DNSConfig) error
    SetEnvVars(vars map[string]string) error
    GetEnvVars() (map[string]string, error)
    RequiresElevation() bool
    PlatformName() string
}
```

### Requirement: 状态管理与回滚

系统 SHALL 维护状态历史记录，支持：

- 每次切换前自动备份当前状态
- 状态持久化到 `~/.netenv/state/` 目录
- 支持回滚到上一个状态
- 状态记录包含时间戳、Profile 名称、变更摘要

### Requirement: 插件化扩展

系统 SHALL 提供插件接口，支持未来扩展：

- 插件接口定义清晰的生命周期（Init、Apply、Rollback、Validate）
- 插件以独立 Go 包形式存在
- 通过配置文件声明启用的插件
- MVP 阶段预留接口但不实现具体插件

### Requirement: 健康检查

系统 SHALL 提供 `netenv doctor` 命令诊断当前网络状态：

- 检查代理连通性
- 检查 DNS 解析功能
- 检查 hosts 文件一致性
- 检查环境变量是否按预期设置
- 输出诊断报告和建议

## REMOVED Requirements

无（全新项目）

## 技术架构

### 项目目录结构

```
netenv/
├── cmd/                          # CLI 命令定义层
│   └── netenv/
│       ├── main.go               # 程序入口
│       ├── root.go               # Cobra root 命令定义
│       ├── switch.go             # switch 子命令
│       ├── list.go               # list 子命令
│       ├── current.go            # current 子命令
│       ├── init.go               # init 子命令
│       ├── validate.go           # validate 子命令
│       ├── rollback.go           # rollback 子命令
│       ├── export.go             # export 子命令
│       ├── import.go             # import 子命令
│       ├── doctor.go             # doctor 子命令
│       └── plugin.go             # plugin 子命令
│
├── internal/                     # 内部实现（不可被外部导入）
│   ├── config/                   # 配置管理模块
│   │   ├── config.go             # 配置加载、合并、校验
│   │   ├── config_test.go
│   │   ├── profile.go            # Profile 数据结构定义
│   │   ├── profile_test.go
│   │   ├── defaults.go           # 默认配置值
│   │   ├── validator.go          # 配置校验逻辑
│   │   └── validator_test.go
│   │
│   ├── network/                  # 网络操作模块
│   │   ├── proxy.go              # 代理配置逻辑
│   │   ├── proxy_test.go
│   │   ├── dns.go                # DNS 配置逻辑
│   │   ├── dns_test.go
│   │   ├── hosts.go              # hosts 文件操作
│   │   ├── hosts_test.go
│   │   ├── envvar.go             # 环境变量操作
│   │   ├── envvar_test.go
│   │   └── health.go             # 网络健康检查
│   │   └── health_test.go
│   │
│   ├── platform/                 # 平台适配层
│   │   ├── adapter.go            # PlatformAdapter 接口定义
│   │   ├── factory.go            # 适配器工厂（根据 OS 选择）
│   │   ├── windows.go            # Windows 平台实现
│   │   ├── windows_test.go
│   │   ├── darwin.go             # macOS 平台实现
│   │   ├── darwin_test.go
│   │   ├── linux.go              # Linux 平台实现
│   │   └── linux_test.go
│   │
│   ├── state/                    # 状态管理模块
│   │   ├── manager.go            # 状态管理器
│   │   ├── manager_test.go
│   │   ├── snapshot.go           # 状态快照数据结构
│   │   └── history.go            # 历史记录管理
│   │   └── history_test.go
│   │
│   ├── plugin/                   # 插件系统
│   │   ├── interface.go          # Plugin 接口定义
│   │   ├── registry.go           # 插件注册表
│   │   └── registry_test.go
│   │
│   └── engine/                   # 执行引擎（编排核心流程）
│       ├── engine.go             # 切换引擎主逻辑
│       ├── engine_test.go
│       ├── executor.go           # 步骤执行器
│       └── executor_test.go
│
├── pkg/                          # 可被外部引用的公共包
│   ├── version/                  # 版本信息
│   │   └── version.go
│   ├── logger/                   # 日志工具
│   │   ├── logger.go
│   │   └── logger_test.go
│   └── errors/                   # 自定义错误类型
│       └── errors.go
│
├── configs/                      # 内置配置模板
│   ├── templates/
│   │   ├── company.yaml          # 公司内网模板
│   │   ├── vpn.yaml              # VPN 环境模板
│   │   ├── test.yaml             # 测试环境模板
│   │   └── direct.yaml           # 直连环境模板
│   └── config.example.yaml       # 全局配置示例
│
├── scripts/                      # 构建和辅助脚本
│   ├── build.sh                  # 跨平台构建脚本
│   ├── build.ps1                 # Windows 构建脚本
│   └── install.sh                # 安装脚本
│
├── .goreleaser.yml               # GoReleaser 配置（发布用）
├── .golangci.yml                 # golangci-lint 配置
├── go.mod
├── go.sum
├── Makefile
└── README.md
```

### 核心模块职责

#### 1. CLI 层 (`cmd/netenv/`)

**职责**：用户交互入口，命令解析，参数校验，输出格式化

- 使用 Cobra 框架定义命令树
- 每个子命令独立文件，保持单一职责
- 负责将用户输入转换为内部调用
- 处理输出格式（表格、JSON、YAML）
- 处理全局标志（`--verbose`、`--dry-run`、`--no-color`）

**关键设计决策**：
- 命令层不包含业务逻辑，仅做参数收集和结果展示
- 通过依赖注入获取 engine 实例

#### 2. 配置管理模块 (`internal/config/`)

**职责**：配置文件的加载、合并、校验、持久化

- `config.go`：负责多层级配置加载和合并（项目级 > Profile > 全局）
- `profile.go`：Profile 数据结构定义，包含所有可配置字段
- `validator.go`：配置校验规则引擎，检查字段类型、范围、依赖关系
- `defaults.go`：内置默认值，确保系统在无配置文件时可运行

**Profile 数据结构**：

```yaml
# profiles/company.yaml
name: company
description: "公司内网环境"

proxy:
  enabled: true
  http: "http://proxy.company.com:8080"
  https: "http://proxy.company.com:8080"
  socks5: ""
  pac: ""
  no_proxy:
    - "localhost"
    - "127.0.0.1"
    - "*.internal.company.com"
    - "10.0.0.0/8"

dns:
  enabled: true
  servers:
    - "10.0.0.1"
    - "10.0.0.2"
  search_domains:
    - "company.com"
    - "internal.company.com"
  split_dns:
    - domain: "company.com"
      servers:
        - "10.0.0.1"
    - domain: "example.com"
      servers:
        - "8.8.8.8"

hosts:
  enabled: true
  entries:
    - ip: "10.0.1.100"
      hostname: "api.internal.company.com"
      comment: "内部 API 服务"
    - ip: "10.0.1.101"
      hostname: "db.internal.company.com"
      comment: "数据库服务器"

env_vars:
  enabled: true
  variables:
    HTTP_PROXY: "http://proxy.company.com:8080"
    HTTPS_PROXY: "http://proxy.company.com:8080"
    NO_PROXY: "localhost,127.0.0.1,.internal.company.com"
    COMPANY_API_KEY: "sk-xxx"
    APP_ENV: "staging"

plugins: []
```

**全局配置结构**：

```yaml
# config.yaml
version: "1"
default_profile: ""
log_level: "info"
color: true
backup:
  enabled: true
  max_history: 20
  directory: "~/.netenv/state"
plugins:
  directory: "~/.netenv/plugins"
  enabled: []
```

#### 3. 网络操作模块 (`internal/network/`)

**职责**：各网络组件的具体操作逻辑

- `proxy.go`：代理配置的解析、构建环境变量、验证连通性
- `dns.go`：DNS 配置逻辑，构建平台无关的 DNS 配置对象
- `hosts.go`：hosts 文件的读取、解析、区块管理（标记插入/清理）
- `envvar.go`：环境变量的展开模板、设置/获取
- `health.go`：网络健康检查（代理连通性、DNS 解析、hosts 一致性）

**关键设计决策**：
- 本模块不直接操作系统，而是构建平台无关的配置对象
- 实际的系统操作委托给平台适配层
- hosts 文件操作使用 `# netenv:begin:<profile>` / `# netenv:end:<profile>` 标记区块

#### 4. 平台适配层 (`internal/platform/`)

**职责**：隔离操作系统差异，提供统一的系统操作接口

- `adapter.go`：定义 `PlatformAdapter` 接口
- `factory.go`：根据运行时 OS 选择对应适配器
- `windows.go`：Windows 平台实现（注册表、netsh、PowerShell）
- `darwin.go`：macOS 平台实现（networksetup、scutil）
- `linux.go`：Linux 平台实现（resolvectl、nmcli、/etc/）

**各平台实现要点**：

| 操作 | Windows | macOS | Linux |
|------|---------|-------|-------|
| 系统代理 | 注册表 `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings` | `networksetup -setwebproxy` | 环境变量 / GNOME gsettings |
| DNS | 注册表 + `netsh interface ip set dns` | `networksetup -setdnsservers` | `/etc/resolv.conf` / `resolvectl` |
| Hosts | `C:\Windows\System32\drivers\etc\hosts` | `/etc/hosts` | `/etc/hosts` |
| 环境变量 | 注册表 `HKCU\Environment` + `setx` | `~/.zshrc` / `launchctl` | `/etc/environment` / shell profile |

#### 5. 状态管理模块 (`internal/state/`)

**职责**：维护切换历史，支持状态回滚

- `snapshot.go`：定义状态快照数据结构，记录切换前的完整状态
- `manager.go`：状态管理器，负责创建快照、保存、加载、清理
- `history.go`：历史记录管理，维护时间线，支持按时间/Profile 查询

**快照数据结构**：
```go
type Snapshot struct {
    Timestamp   time.Time              `yaml:"timestamp"`
    ProfileName string                 `yaml:"profile_name"`
    Proxy       *ProxyState            `yaml:"proxy,omitempty"`
    DNS         *DNSState              `yaml:"dns,omitempty"`
    Hosts       *HostsState            `yaml:"hosts,omitempty"`
    EnvVars     map[string]string      `yaml:"env_vars,omitempty"`
    Metadata    map[string]interface{} `yaml:"metadata,omitempty"`
}
```

#### 6. 插件系统 (`internal/plugin/`)

**职责**：提供可扩展的插件框架

- `interface.go`：定义 `Plugin` 接口（Init、Apply、Rollback、Validate、Name、Version）
- `registry.go`：插件注册表，管理插件的注册、查找、生命周期

**Plugin 接口**：
```go
type Plugin interface {
    Name() string
    Version() string
    Init(config map[string]interface{}) error
    Validate(profile *config.Profile) error
    Apply(ctx *ExecutionContext) error
    Rollback(ctx *ExecutionContext) error
}
```

MVP 阶段仅定义接口，不实现具体插件。后续版本可实现：
- `kubernetes-plugin`：Kubernetes context 切换
- `cloud-plugin`：云环境配置切换
- `vpn-plugin`：VPN 连接管理

#### 7. 执行引擎 (`internal/engine/`)

**职责**：编排切换流程，协调各模块

- `engine.go`：切换引擎主逻辑，负责整体流程编排
- `executor.go`：步骤执行器，按顺序执行各操作步骤，支持错误处理和回滚

**切换流程**：
```
1. 加载配置（config 模块）
2. 校验配置（validator）
3. 创建当前状态快照（state 模块）
4. 执行插件 Validate 钩子（plugin 模块）
5. 按顺序执行：
   a. 应用 hosts 配置
   b. 应用 DNS 配置
   c. 应用代理配置
   d. 应用环境变量
6. 执行插件 Apply 钩子
7. 执行健康检查（health）
8. 保存状态记录
9. 输出结果摘要
```

**错误处理策略**：
- 任何步骤失败时，已执行的步骤通过快照回滚
- 回滚失败时输出详细的手动恢复指南
- 支持 `--dry-run` 模式预览变更而不实际执行

### 数据流

```
用户输入
    │
    ▼
┌─────────────┐
│  CLI 层     │  解析命令和参数
│  (cmd/)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Engine     │  编排执行流程
│  (engine/)  │
└──────┬──────┘
       │
       ├──────────────────────────────────────────────────┐
       │                                                  │
       ▼                                                  ▼
┌─────────────┐                                  ┌──────────────┐
│  Config     │  加载/合并/校验配置               │  State       │
│  (config/)  │                                  │  (state/)    │
└──────┬──────┘                                  └──────────────┘
       │
       ▼
┌─────────────┐
│  Network    │  构建网络配置对象
│  (network/) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Platform   │  调用系统 API 执行变更
│  (platform/)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Plugin     │  执行插件钩子
│  (plugin/)  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Health     │  验证变更结果
│  (health/)  │
└──────┬──────┘
       │
       ▼
    结果输出
```

### MVP 与后续版本功能拆分

#### MVP (v0.1.0) - 核心功能

| 功能 | 优先级 | 说明 |
|------|--------|------|
| CLI 框架搭建 | P0 | Cobra 基础命令结构，支持 `switch`、`list`、`current`、`init` |
| YAML 配置加载 | P0 | 单 Profile 文件加载和校验 |
| 代理配置切换 | P0 | HTTP/HTTPS 代理的系统级设置 |
| DNS 配置切换 | P0 | 系统 DNS 服务器设置 |
| Hosts 文件管理 | P0 | 标记区块式 hosts 条目管理 |
| 环境变量设置 | P0 | 用户级环境变量设置 |
| Windows 平台适配 | P0 | Windows 平台完整实现 |
| macOS 平台适配 | P1 | macOS 平台完整实现 |
| Linux 平台适配 | P1 | Linux 平台完整实现 |
| 基础状态备份 | P0 | 切换前备份，支持 rollback |
| 配置模板 | P1 | 内置常用环境模板 |

#### v0.2.0 - 增强功能

| 功能 | 说明 |
|------|------|
| 多层级配置合并 | 项目级 > Profile > 全局 |
| `validate` 命令 | 配置文件深度校验 |
| `doctor` 命令 | 网络环境诊断 |
| `export` / `import` | 配置方案的导入导出 |
| 干跑模式 | `--dry-run` 预览变更 |
| 详细日志 | `--verbose` 调试输出 |
| 彩色输出 | 终端彩色结果展示 |

#### v0.3.0 - 插件化与扩展

| 功能 | 说明 |
|------|------|
| 插件接口定义 | Plugin 接口和注册机制 |
| Kubernetes 插件 | K8s context 切换支持 |
| VPN 插件 | VPN 连接管理 |
| GUI 原型 | 基于 Fyne 或 Wails 的桌面 GUI |
| 配置文件监控 | 文件变化自动提示切换 |

#### v1.0.0 - 生产就绪

| 功能 | 说明 |
|------|------|
| 完整插件生态 | 社区插件支持 |
| Shell 自动补全 | Bash/Zsh/Fish/PowerShell |
| CI/CD 集成 | GitHub Actions / GitLab CI 发布流水线 |
| 自动更新 | 内置版本检查和自动更新 |
| 国际化 | 中英文界面支持 |

### 潜在技术难点与解决方案

#### 1. 管理员/root 权限提升

**难点**：修改 hosts 文件、系统 DNS、系统代理等操作需要管理员权限。

**解决方案**：
- 检测当前权限，不足时自动提示
- Windows：使用 `runas` 或 UAC 提升
- macOS/Linux：使用 `sudo` 提升，提供 `--sudo` 标志
- 设计为仅对需要提权的操作请求权限，不全程提权
- 提供 `--no-elevation` 标志跳过需要提权的操作

#### 2. DNS 配置生效延迟

**难点**：修改 DNS 后可能存在缓存，导致新配置不能立即生效。

**解决方案**：
- 修改 DNS 后自动执行 DNS 缓存刷新（`ipconfig /flushdns`、`sudo dscacheutil -flushcache`、`sudo systemd-resolve --flush-caches`）
- 健康检查中验证 DNS 解析是否使用新配置
- 提供可配置的生效等待时间

#### 3. 环境变量生效范围

**难点**：环境变量修改对已运行的进程不生效。

**解决方案**：
- MVP 阶段：设置用户级环境变量，提示用户重启终端
- 后续版本：支持启动子 shell 自动加载新变量
- 文档中明确说明生效范围限制

#### 4. hosts 文件并发修改

**难点**：其他工具可能同时修改 hosts 文件。

**解决方案**：
- 使用文件锁（`syscall.Flock` / Windows `LockFileEx`）确保原子操作
- 修改前读取、修改后验证内容一致性
- 写入失败时重试（最多 3 次，间隔 100ms）

#### 5. 跨平台差异处理

**难点**：Windows/macOS/Linux 的系统配置方式差异巨大。

**解决方案**：
- 平台适配层完全隔离操作系统差异
- 使用构建标签（build tags）编译平台特定代码
- 接口定义在公共文件，实现在 `_windows.go`、`_darwin.go`、`_linux.go`
- 每个平台独立测试，CI 多平台矩阵构建

#### 6. 配置文件向后兼容

**难点**：后续版本可能需要修改配置文件格式。

**解决方案**：
- 配置文件包含 `version` 字段
- 实现配置迁移器（migrator），自动升级旧版本配置
- 严格校验未知字段并给出警告

### 依赖选型

| 依赖 | 用途 | 版本 |
|------|------|------|
| `github.com/spf13/cobra` | CLI 框架 | v1.8+ |
| `github.com/spf13/viper` | 配置管理辅助 | v1.18+ |
| `gopkg.in/yaml.v3` | YAML 解析 | v3.0.1 |
| `github.com/fatih/color` | 终端彩色输出 | v1.16+ |
| `github.com/olekukonez/tablewriter` | 表格输出 | v0.0.5 |
| `go.uber.org/zap` | 结构化日志 | v1.27+ |
| `github.com/stretchr/testify` | 测试框架 | v1.9+ |
| `github.com/golangci/golangci-lint` | 代码质量检查 | v1.57+ |
