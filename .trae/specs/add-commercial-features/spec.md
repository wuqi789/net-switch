# 商业级功能增强方案 Spec

## Why

net-switch 当前为开源单机版 CLI + GUI 工具。要实现商业化发布，需要增加团队协作、安全加密、智能规则、云原生集成等高级功能，并通过插件系统实现架构可扩展。同时需要明确商业版（Pro）与开源版（Community）的功能边界。

## What Changes

- 新增插件系统：统一生命周期管理、自动发现、依赖解析、配置注入
- 新增加密模块：AES-256-GCM 配置加密、主密钥管理、运行时自动解密
- 新增团队同步模块：远程配置拉取、增量合并、冲突解决
- 新增自动规则引擎：基于域名/IP/进程名的自动 Profile 切换
- 新增 Kubernetes 插件：context/namespace 切换、kubeconfig 合并
- 新增登录系统（可选）：本地离线 + 远程 OAuth 两种模式
- 新增商业版授权验证：设备指纹 + License Key 校验
- 新增数据结构：插件 manifest、加密配置容器、规则引擎 DSL、团队配置格式

## Impact

- Affected specs: netenv-switch（插件接口升级）、net-switch-cross-platform（加密集成）、add-gui-desktop-app（团队功能 UI）
- Affected code: `net-switch/internal/` 下新增 plugin/、crypto/、sync/、rules/、k8s/ 模块
- GUI 代码: `net-switch-gui/src/` 下新增团队管理、规则编辑器、插件管理 UI

---

## 一、技术方案总体架构

### 1.1 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                    用户交互层                             │
│         CLI (Cobra)  │  GUI (Tauri+React)               │
├─────────────────────────────────────────────────────────┤
│                    业务编排层                             │
│   Engine  │  RuleEngine  │  SyncManager  │  AuthManager  │
├─────────────────────────────────────────────────────────┤
│                    插件系统层                             │
│   PluginRegistry  │  PluginLoader  │  PluginSandbox      │
├─────────────────────────────────────────────────────────┤
│                    核心服务层                             │
│   Config  │  NetworkManager  │  Crypto  │  State         │
├─────────────────────────────────────────────────────────┤
│                    平台适配层                             │
│   Windows  │  macOS  │  Linux  │  K8s                    │
└─────────────────────────────────────────────────────────┘
```

### 1.2 模块依赖关系

```
CLI/GUI
  └── Engine
        ├── Config（配置加载/校验/合并）
        ├── Crypto（加密/解密，拦截 Config 读写）
        ├── Sync（远程配置同步，依赖 Crypto + Config）
        ├── RuleEngine（自动匹配，依赖 Config + NetworkManager）
        ├── Auth（登录验证，供 Sync 使用）
        ├── PluginRegistry
        │     ├── K8sPlugin（依赖 kubectl/kubeconfig）
        │     ├── VPNPlugin（未来扩展）
        │     └── CustomPlugin（第三方）
        ├── NetworkManager（跨平台网络操作）
        └── State（状态快照/回滚）
```

---

## 二、插件系统设计（重点）

### 2.1 设计目标

- **低耦合**：插件通过接口交互，不依赖内部实现
- **可发现**：从指定目录自动扫描加载
- **可配置**：每个插件有独立配置段，由主程序注入
- **生命周期完整**：Init → Validate → Apply → Rollback → Cleanup
- **双向通信**：插件可向主程序注册自定义 CLI 命令
- **热加载**（Pro 版）：运行时动态加载/卸载插件

### 2.2 插件接口定义

```go
// internal/plugin/interface.go

// Plugin 是所有插件必须实现的核心接口
type Plugin interface {
    // 元信息
    Manifest() Manifest

    // 生命周期
    Init(ctx PluginContext) error
    Cleanup() error

    // Profile 切换钩子
    Validate(profile *config.Profile) error
    Apply(ctx *ExecutionContext) error
    Rollback(ctx *ExecutionContext) error
}

// Manifest 描述插件元信息
type Manifest struct {
    Name         string            `yaml:"name"`
    Version      string            `yaml:"version"`
    Author       string            `yaml:"author"`
    Description  string            `yaml:"description"`
    MinVersion   string            `yaml:"min_version"`    // 要求的 net-switch 最低版本
    Dependencies []string          `yaml:"dependencies"`   // 依赖的其他插件名
    Permissions  []Permission      `yaml:"permissions"`    // 所需权限声明
    Commands     []CommandDef      `yaml:"commands"`       // 注册的 CLI 子命令
    ConfigSchema map[string]string `yaml:"config_schema"`  // 配置字段 schema
}

// Permission 定义插件所需的系统权限
type Permission string

const (
    PermNetwork    Permission = "network"     // 修改网络配置
    PermFileSystem Permission = "filesystem"  // 读写文件系统
    PermKubernetes Permission = "kubernetes"  // 访问 K8s API
    PermExec       Permission = "exec"        // 执行外部命令
    PermCrypto     Permission = "crypto"      // 加密/解密操作
)

// CommandDef 定义插件注册的 CLI 命令
type CommandDef struct {
    Use         string `yaml:"use"`          // 如 "k8s switch"
    Short       string `yaml:"short"`
    Long        string `yaml:"long"`
    Handler     string `yaml:"handler"`      // 处理函数名（反射或注册表）
}

// PluginContext 提供给插件的运行时上下文
type PluginContext struct {
    ConfigDir   string                     // 配置目录路径
    StateDir    string                     // 状态目录路径
    PluginDir   string                     // 插件自身目录
    Logger      Logger                     // 结构化日志
    Config      map[string]interface{}     // 插件专属配置段
    HttpClient  HttpClient                 // HTTP 客户端（可选）
    Commands    *CommandRegistry           // CLI 命令注册器
}

// ExecutionContext 包含单次切换操作的上下文
type ExecutionContext struct {
    Profile     *config.Profile
    OldProfile  string
    DryRun      bool
    Verbose     bool
    Snapshot    *state.Snapshot
    Logger      Logger
}
```

### 2.3 插件发现与加载

```
~/.net-switch/
├── plugins/
│   ├── k8s-plugin/
│   │   ├── plugin.yaml        # Manifest 文件
│   │   ├── plugin.so          # 编译后的 Go plugin（Linux/macOS）
│   │   └── config.yaml        # 插件专属配置
│   ├── auto-rules/
│   │   ├── plugin.yaml
│   │   └── plugin.so
│   └── team-sync/
│       ├── plugin.yaml
│       └── plugin.so
├── config.yaml
└── state.yaml
```

**加载流程**：
1. 扫描 `~/.net-switch/plugins/` 下所有子目录
2. 读取每个子目录的 `plugin.yaml` 校验 Manifest
3. 检查依赖关系（DAG 排序）
4. 检查权限声明，与用户授权比对
5. 使用 Go `plugin.Open()` 加载 `.so` 文件
6. 查找导出的 `NewPlugin()` 工厂函数
7. 调用 `Plugin.Init(ctx)` 初始化

> **Go plugin 限制说明**：Go 的 plugin 包仅支持 Linux 和 macOS。Windows 上采用 gRPC 子进程模式：
> - 插件作为独立进程运行，监听 Unix socket/named pipe
> - 主程序通过 gRPC 与插件通信
> - 这也是商业版可采用的更安全模式

### 2.4 插件配置注入

在主配置 `config.yaml` 中为每个插件配置独立段：

```yaml
# config.yaml
version: "2"
profiles: [...]

plugins:
  enabled:
    - k8s-plugin
    - auto-rules
    - team-sync
  directory: "~/.net-switch/plugins"

  configs:
    k8s-plugin:
      kubeconfig: "~/.kube/config"
      auto_switch: true
      namespaces:
        company: "production"
        test: "staging"
    auto-rules:
      rules_file: "~/.net-switch/rules.yaml"
      watch_interval: 5s
    team-sync:
      server_url: "https://sync.netenv.dev"
      team_id: "team-abc123"
      auto_pull: true
      pull_interval: 30s
```

### 2.5 插件沙箱（Pro 版）

Pro 版插件运行在受限沙箱中：
- 文件系统访问白名单（`plugin_dir` + `config_dir`）
- 网络访问限制（仅允许声明的域名）
- 资源限制（内存 ≤ 50MB，CPU 时间 ≤ 5s/次）
- 审计日志记录所有插件操作

---

## 三、数据结构设计

### 3.1 加密配置容器

```go
// internal/crypto/container.go

// EncryptedContainer 是加密后的配置容器
type EncryptedContainer struct {
    Version   string `yaml:"version"`    // "1"
    Algorithm string `yaml:"algorithm"`  // "aes-256-gcm"
    KDF       string `yaml:"kdf"`        // "argon2id" 或 "pbkdf2"
    Salt      string `yaml:"salt"`       // Base64 编码的盐值
    Nonce     string `yaml:"nonce"`      // Base64 编码的随机数
    Data      string `yaml:"data"`       // Base64 编码的密文
    Checksum  string `yaml:"checksum"`   // SHA-256 校验和
    CreatedAt string `yaml:"created_at"`
    CreatedBy string `yaml:"created_by"` // 设备指纹
}
```

加密后文件示例：
```yaml
# config.enc.yaml
version: "1"
algorithm: "aes-256-gcm"
kdf: "argon2id"
salt: "a2V5c2FsdDEyMzQ1Njc4"
nonce: "bm9uY2UxMjM0NTY3"
data: "ZW5jcnlwdGVkX2RhdGFfaGVyZQ=="
checksum: "sha256:a1b2c3d4e5..."
created_at: "2026-05-03T10:00:00Z"
created_by: "device-abc123"
```

### 3.2 自动规则数据结构

```go
// internal/rules/rule.go

// RuleSet 定义一组自动切换规则
type RuleSet struct {
    Version string `yaml:"version"`
    Rules   []Rule `yaml:"rules"`
}

// Rule 定义单条自动切换规则
type Rule struct {
    Name        string      `yaml:"name"`
    Description string      `yaml:"description"`
    Priority    int         `yaml:"priority"`     // 越大越优先
    Enabled     bool        `yaml:"enabled"`
    Trigger     Trigger     `yaml:"trigger"`
    Action      Action      `yaml:"action"`
    Cooldown    string      `yaml:"cooldown"`     // 触发冷却时间，如 "5m"
}

// Trigger 定义触发条件
type Trigger struct {
    Type     TriggerType  `yaml:"type"`
    Value    string       `yaml:"value"`
    Operator string       `yaml:"operator"`  // "match", "contains", "regex", "cidr"
}

type TriggerType string

const (
    TriggerDomain   TriggerType = "domain"    // 域名匹配
    TriggerIP       TriggerType = "ip"        // IP/CIDR 匹配
    TriggerProcess  TriggerType = "process"   // 进程名匹配
    TriggerSSID     TriggerType = "ssid"      // WiFi SSID 匹配
    TriggerTime     TriggerType = "time"      // 时间范围匹配
    TriggerNetwork  TriggerType = "network"   // 网络接口状态变化
)

// Action 定义触发后执行的操作
type Action struct {
    Type       ActionType `yaml:"type"`
    Profile    string     `yaml:"profile"`     // 目标 Profile 名称
    Notify     bool       `yaml:"notify"`      // 是否通知用户
    AutoSwitch bool       `yaml:"auto_switch"` // 是否自动切换（vs 提示）
}

type ActionType string

const (
    ActionSwitchProfile ActionType = "switch_profile"  // 切换 Profile
    ActionSetProxy      ActionType = "set_proxy"       // 仅设置代理
    ActionRunCommand    ActionType = "run_command"      // 执行自定义命令
)
```

规则配置示例：
```yaml
# rules.yaml
version: "1"
rules:
  - name: "公司网络自动切换"
    description: "连接公司 WiFi 时自动切换到公司环境"
    priority: 100
    enabled: true
    trigger:
      type: ssid
      value: "Corp-WiFi-5G"
      operator: match
    action:
      type: switch_profile
      profile: company
      notify: true
      auto_switch: true
    cooldown: "5m"

  - name: "GitHub 代理"
    description: "访问 GitHub 时自动使用代理"
    priority: 50
    enabled: true
    trigger:
      type: domain
      value: "*.github.com"
      operator: match
    action:
      type: set_proxy
      profile: vpn
      notify: false
      auto_switch: false
```

### 3.3 团队配置数据结构

```go
// internal/sync/team.go

// TeamConfig 团队配置元信息
type TeamConfig struct {
    TeamID      string            `yaml:"team_id"`
    TeamName    string            `yaml:"team_name"`
    ServerURL   string            `yaml:"server_url"`
    Auth        AuthConfig        `yaml:"auth"`
    Sync        SyncConfig        `yaml:"sync"`
    Shared      SharedProfiles    `yaml:"shared_profiles"`
}

// AuthConfig 认证配置
type AuthConfig struct {
    Mode       string `yaml:"mode"`        // "token", "oauth", "certificate"
    Token      string `yaml:"token"`       // API Token（加密存储）
    OAuth      *OAuthConfig `yaml:"oauth,omitempty"`
    CertFile   string `yaml:"cert_file,omitempty"`
    KeyFile    string `yaml:"key_file,omitempty"`
}

// OAuthConfig OAuth 配置
type OAuthConfig struct {
    ClientID     string `yaml:"client_id"`
    IssuerURL    string `yaml:"issuer_url"`
    RedirectURL  string `yaml:"redirect_url"`
    Scopes       []string `yaml:"scopes"`
}

// SyncConfig 同步策略
type SyncConfig struct {
    AutoPull      bool   `yaml:"auto_pull"`       // 自动拉取
    PullInterval  string `yaml:"pull_interval"`   // 拉取间隔
    ConflictMode  string `yaml:"conflict_mode"`   // "local_wins", "remote_wins", "ask"
    MergeStrategy string `yaml:"merge_strategy"`  // "replace", "merge_profiles"
}

// SharedProfiles 远程共享的 Profile 列表
type SharedProfiles struct {
    Version    string              `yaml:"version"`
    UpdatedAt  string              `yaml:"updated_at"`
    UpdatedBy  string              `yaml:"updated_by"`
    Profiles   []config.Profile    `yaml:"profiles"`
    Signature  string              `yaml:"signature"`  // 配置签名，防篡改
}
```

### 3.4 Kubernetes 上下文数据

```go
// internal/plugins/k8s/types.go

// K8sPluginConfig K8s 插件配置
type K8sPluginConfig struct {
    Kubeconfig    string                    `yaml:"kubeconfig"`
    AutoSwitch    bool                      `yaml:"auto_switch"`
    ContextMap    map[string]K8sContextMap   `yaml:"context_map"`  // Profile → K8s 映射
}

// K8sContextMap 定义 Profile 与 K8s context 的映射
type K8sContextMap struct {
    Context   string `yaml:"context"`    // K8s context 名称
    Namespace string `yaml:"namespace"`  // 默认 namespace
    Cluster   string `yaml:"cluster"`    // 集群名称
}
```

### 3.5 商业授权数据

```go
// internal/license/license.go

// License 授权信息
type License struct {
    Key         string    `yaml:"key"`           // License Key
    Type        string    `yaml:"type"`          // "trial", "personal", "team", "enterprise"
    IssuedAt    time.Time `yaml:"issued_at"`
    ExpiresAt   time.Time `yaml:"expires_at"`
    Features    []string  `yaml:"features"`      // 启用的功能列表
    MaxDevices  int       `yaml:"max_devices"`   // 最大设备数
    DeviceID    string    `yaml:"device_id"`     // 当前设备指纹
}

// FeatureFlag 功能开关
type FeatureFlag string

const (
    FeaturePluginSystem  FeatureFlag = "plugin_system"
    FeatureEncryption    FeatureFlag = "encryption"
    FeatureTeamSync      FeatureFlag = "team_sync"
    FeatureAutoRules     FeatureFlag = "auto_rules"
    FeatureK8sPlugin     FeatureFlag = "k8s_plugin"
    FeatureHotReload     FeatureFlag = "hot_reload"
    FeatureSandbox       FeatureFlag = "sandbox"
    FeaturePriority      FeatureFlag = "priority_support"
)
```

---

## 四、插件机制详细设计

### 4.1 插件生命周期状态机

```
┌──────┐  Init()   ┌──────────┐  Validate()  ┌──────────┐
│ 无   │ ────────→  │ 已初始化 │ ───────────→  │ 已校验   │
└──────┘           └──────────┘              └──────────┘
                     ↑ error                      │
                     │                            │ Apply()
                     │    ┌──────────────┐        ↓
                     ├─── │ Cleanup()    │ ←── ┌──────────┐
                     │    └──────────────┘     │ 执行中   │
                     │         ↑               └──────────┘
                     │         │ Rollback()        │
                     │         └───────────────────┘ error
                     │
                     │         ┌──────────────┐
                     └──────── │ 已完成       │ ←── 成功
                               └──────────────┘
```

### 4.2 插件注册表实现

```go
// internal/plugin/registry.go

type Registry struct {
    plugins    map[string]Plugin
    manifests  map[string]Manifest
    configs    map[string]map[string]interface{}
    order      []string              // 按依赖排序
    mu         sync.RWMutex
}

func (r *Registry) Register(p Plugin) error
func (r *Registry) LoadDir(dir string) error
func (r *Registry) Get(name string) (Plugin, bool)
func (r *Registry) List() []Manifest
func (r *Registry) Enable(name string) error
func (r *Registry) Disable(name string) error
func (r *Registry) ValidateAll(profile *config.Profile) error
func (r *Registry) ApplyAll(ctx *ExecutionContext) error
func (r *Registry) RollbackAll(ctx *ExecutionContext) error
```

### 4.3 插件间通信

插件之间通过事件总线通信：

```go
// internal/plugin/event.go

type EventBus struct {
    subscribers map[string][]EventHandler
    mu          sync.RWMutex
}

type EventHandler func(event Event)

type Event struct {
    Type      string                 // "profile.switched", "proxy.changed", etc.
    Source    string                 // 产生事件的插件名
    Timestamp time.Time
    Data      map[string]interface{}
}

// 插件在 Init 时注册感兴趣的事件
func (eb *EventBus) Subscribe(eventType string, handler EventHandler)
func (eb *EventBus) Publish(event Event)
```

### 4.4 内置插件接口扩展

```go
// 自定义 CLI 命令注册
type CommandRegistry struct {
    rootCmd *cobra.Command
}

func (cr *CommandRegistry) Register(cmd *cobra.Command)

// 插件在 Init 时注册自定义命令
func (p *K8sPlugin) Init(ctx PluginContext) error {
    ctx.Commands.Register(&cobra.Command{
        Use:   "k8s context",
        Short: "切换 Kubernetes context",
        RunE:  p.handleSwitchContext,
    })
    return nil
}
```

---

## 五、各功能模块技术方案

### 5.1 配置加密模块

**技术选型**：
- 对称加密：AES-256-GCM（认证加密，防篡改）
- 密钥派生：Argon2id（首选）/ PBKDF2（兼容）
- 主密钥来源：用户口令 → KDF → 主密钥

**密钥管理流程**：
```
用户口令 ──→ Argon2id(KDF) ──→ 主密钥(256-bit)
                                    │
                                    ├──→ 加密 config.yaml → config.enc.yaml
                                    ├──→ 加密敏感字段（token, proxy密码）
                                    └──→ 加密 team-sync 认证信息
```

**敏感字段级加密**：
```yaml
# 支持字段级加密标记
profiles:
  - name: company
    http_proxy: "http://proxy.company.com:8080"
    https_proxy: "${encrypted:YWJjZGVmZ2hpams...}"  # 加密标记
    api_key: "${encrypted:aWprbDFrMmQzajQ0..."}

# 自动加密字段列表（可配置）
crypto:
  auto_encrypt:
    - "*.api_key"
    - "*.token"
    - "*.password"
    - "*.secret"
  master_key_source: "password"  # 或 "keyfile", "os_keychain"
```

### 5.2 团队配置同步

**同步架构**：
```
                    ┌──────────────┐
                    │  Sync Server │
                    │  (REST API)  │
                    └──────┬───────┘
                           │ HTTPS
            ┌──────────────┼──────────────┐
            │              │              │
        ┌───┴───┐     ┌───┴───┐     ┌───┴───┐
        │ 设备A │     │ 设备B │     │ 设备C │
        └───────┘     └───────┘     └───────┘
```

**同步协议**：
```
1. 拉取流程：
   GET /api/v1/teams/{team_id}/profiles
   → 返回 SharedProfiles（含签名）
   → 验证签名防篡改
   → 按 merge_strategy 合并到本地

2. 推送流程：
   PUT /api/v1/teams/{team_id}/profiles
   → 上传本地配置（加密传输）
   → 服务端校验冲突
   → 返回合并结果

3. 增量同步：
   GET /api/v1/teams/{team_id}/profiles?since={version}
   → 仅返回变更部分
```

**冲突解决策略**：
- `remote_wins`：远程配置覆盖本地（团队管理员推荐）
- `local_wins`：本地配置覆盖远程
- `merge_profiles`：按 profile name 合并，同名远程优先
- `ask`：GUI 中弹窗让用户选择

### 5.3 自动规则引擎

**规则匹配流程**：
```
网络事件（域名解析/进程启动/WiFi变化）
    │
    ▼
┌─────────────────┐
│ 事件收集器       │ ← DNS Hook / 进程监控 / 网络状态监听
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 规则匹配引擎     │ ← 遍历规则，按 priority 排序
└────────┬────────┘
         │ 匹配成功
         ▼
┌─────────────────┐
│ 冷却检查器       │ ← 检查 cooldown 间隔
└────────┬────────┘
         │ 通过
         ▼
┌─────────────────┐
│ 动作执行器       │ ← 切换 Profile / 设置代理 / 执行命令
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 通知器           │ ← GUI 通知 / CLI 输出
└─────────────────┘
```

**网络监听实现**：
- **域名匹配**：Hook 系统 DNS 查询（需 root/管理员），或通过代理日志分析
- **WiFi SSID**：Windows: `netsh wlan show interfaces`; macOS: `networksetup -getairportnetwork`; Linux: `nmcli -t -f active,ssid dev wifi`
- **IP/CIDR**：解析连接目标 IP，匹配 CIDR 范围
- **进程名**：Windows: `Get-NetTCPConnection`; macOS/Linux: `lsof -i` 或 `/proc/net/tcp`

### 5.4 Kubernetes 插件

**功能**：
- 切换 K8s context（等效 `kubectl config use-context`）
- 切换 default namespace
- 合并多个 kubeconfig 文件
- Profile 与 context 自动绑定

**CLI 扩展命令**：
```bash
# 在 net-switch 中新增的 K8s 子命令
net-switch k8s list              # 列出所有 context
net-switch k8s current           # 显示当前 context
net-switch k8s switch <context>  # 切换 context
net-switch k8s ns <namespace>    # 切换 namespace
net-switch k8s merge <file>      # 合并 kubeconfig
```

**Profile 集成**：
```yaml
# config.yaml
profiles:
  - name: company
    http_proxy: "http://proxy:8080"
    plugins:
      k8s-plugin:
        context: "prod-cluster"
        namespace: "production"
```

### 5.5 登录系统

**双模式设计**：

| 模式 | 场景 | 说明 |
|------|------|------|
| 离线模式（默认） | 个人用户 | 无需登录，仅本地口令加密 |
| 在线模式（Pro） | 团队用户 | OAuth2 / SSO 登录，获取 API Token |

**OAuth 流程**：
```
CLI/GUI
  │
  ├─→ 浏览器打开授权页
  │
  └─→ 回调接收 auth_code
       │
       └─→ 换取 access_token + refresh_token
            │
            └─→ Token 存储到 OS Keychain
                 ├── Windows: Credential Manager
                 ├── macOS: Keychain
                 └── Linux: Secret Service (gnome-keyring)
```

---

## 六、商业版 vs 开源版功能划分

### 6.1 功能矩阵

| 功能模块 | 开源版 (Community) | 商业版 (Pro) |
|----------|:------------------:|:------------:|
| **核心 CLI** | ✅ | ✅ |
| Profile 切换（代理/DNS/hosts） | ✅ | ✅ |
| 跨平台支持（Win/Mac/Linux） | ✅ | ✅ |
| 干跑模式 (--dry-run) | ✅ | ✅ |
| 状态备份与回滚 | ✅ | ✅ |
| JSON 输出 (--format json) | ✅ | ✅ |
| **GUI 桌面应用** | ✅ 基础版 | ✅ 增强版 |
| Profile 列表与一键切换 | ✅ | ✅ |
| 配置编辑器 | ✅ 表单编辑 | ✅ 表单 + 可视化 |
| 系统托盘 | ✅ | ✅ |
| **插件系统** | ✅ 基础版 | ✅ 完整版 |
| 插件加载与执行 | ✅ (Go plugin) | ✅ (Go plugin + gRPC) |
| 插件 CLI 命令注册 | ✅ | ✅ |
| 插件事件总线 | ✅ | ✅ |
| 热加载（运行时加载/卸载） | ❌ | ✅ |
| 插件沙箱隔离 | ❌ | ✅ |
| **配置加密** | ❌ | ✅ |
| AES-256-GCM 全量加密 | ❌ | ✅ |
| 敏感字段级加密 | ❌ | ✅ |
| OS Keychain 集成 | ❌ | ✅ |
| **团队配置同步** | ❌ | ✅ |
| 远程配置拉取 | ❌ | ✅ |
| 增量同步 | ❌ | ✅ |
| 冲突解决策略 | ❌ | ✅ |
| 配置签名验证 | ❌ | ✅ |
| **自动规则引擎** | ❌ | ✅ |
| 域名/IP 匹配规则 | ❌ | ✅ |
| WiFi SSID 触发 | ❌ | ✅ |
| 进程名触发 | ❌ | ✅ |
| **Kubernetes 插件** | ❌ | ✅ |
| Context 切换 | ❌ | ✅ |
| Namespace 管理 | ❌ | ✅ |
| Kubeconfig 合并 | ❌ | ✅ |
| **登录系统** | ❌ | ✅ |
| 离线口令加密 | ✅ | ✅ |
| OAuth / SSO | ❌ | ✅ |
| **高级功能** | ❌ | ✅ |
| 优先技术支持 | ❌ | ✅ |
| 自动更新 | ✅ 基础 | ✅ 优先推送 |
| 审计日志 | ❌ | ✅ |
| 多配置文件管理 | ✅ | ✅ |

### 6.2 定价模型建议

| 版本 | 价格 | 设备数 | 说明 |
|------|------|--------|------|
| Community | 免费 | 无限 | 核心功能 + 基础 GUI + 基础插件 |
| Pro Personal | $49/年 | 3 台 | 全功能 + 优先支持 |
| Pro Team | $199/年/席位 | 按席位 | 全功能 + 团队同步 + 管理后台 |
| Enterprise | 联系销售 | 无限 | 全功能 + SSO + 私有部署 + SLA |

### 6.3 授权验证机制

```
License Key 格式：NETSW-XXXX-XXXX-XXXX-XXXX

验证流程：
1. 解析 License Key，提取版本和功能列表
2. 生成设备指纹（CPU ID + 主板序列号 + MAC 地址哈希）
3. 向授权服务器验证（首次 + 每 7 天续期）
4. 离线时使用本地缓存（最长 30 天宽限期）
5. 功能开关：根据 License.FeatureFlags 启用/禁用功能
```

---

## 七、实施路线图

### Phase 1：插件系统基础（4 周）
- Plugin 接口定义与 Registry 实现
- 插件发现与加载机制
- 插件配置注入
- 内置示例插件（echo-plugin）

### Phase 2：配置加密（2 周）
- AES-256-GCM 加密/解密模块
- Argon2id 密钥派生
- 敏感字段标记与自动加密
- CLI 命令：`net-switch encrypt` / `net-switch decrypt`

### Phase 3：自动规则引擎（3 周）
- 规则 DSL 解析
- WiFi SSID 监听
- 域名匹配（基于 DNS 查询记录）
- 规则冷却与优先级
- CLI 命令：`net-switch rules list` / `net-switch rules test`

### Phase 4：Kubernetes 插件（2 周）
- kubeconfig 解析与切换
- Context/Namespace 管理
- Profile 与 K8s context 绑定
- CLI 子命令注册

### Phase 5：团队同步 + 登录（4 周）
- Sync Server API 设计与实现
- OAuth 登录流程
- 增量同步协议
- 冲突解决引擎
- OS Keychain 集成

### Phase 6：商业授权 + 发布（2 周）
- License Key 生成与验证
- 设备指纹算法
- 功能开关系统
- GUI 中商业功能入口

---

## REMOVED Requirements

无

## MODIFIED Requirements

### Requirement: 插件系统（升级 netenv-switch 中的定义）

将 MVP 阶段的简单 Plugin 接口升级为完整的插件系统，支持 Manifest、事件总线、CLI 命令注册、配置注入、生命周期管理。

### Requirement: 配置管理

配置加载链增加加密层：加载配置时自动检测是否为加密格式，解密后继续处理。保存时根据用户设置选择是否加密。
