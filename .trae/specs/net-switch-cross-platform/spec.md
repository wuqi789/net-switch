# 跨平台网络管理模块 Spec

## Why

当前 net-switch 的网络操作模块（proxy/hosts/dns）仅支持 Linux，且直接使用平台相关的常量和系统调用。需要抽象为统一接口，使 Windows 和 macOS 也能使用相同功能。

## What Changes

- 抽象 `NetworkManager` 统一接口，定义代理、hosts、DNS、权限检查的标准方法
- 将现有 Linux 实现重构为 `linuxManager`，实现 `NetworkManager` 接口
- 新增 `windowsManager` 实现（注册表 + netsh）
- 新增 `darwinManager` 实现（networksetup + scutil）
- 新增工厂函数，通过 `runtime.GOOS` 自动创建对应平台的 Manager
- 编排器 `network.go` 改为依赖接口而非直接调用函数
- 各平台使用平台特有的配置路径、命令和权限机制

## Impact

- Affected specs: net-switch-linux-network
- Affected code: `net-switch/internal/network/` 目录下所有文件

## ADDED Requirements

### Requirement: NetworkManager 统一接口

系统 SHALL 定义一个 `NetworkManager` 接口，所有平台实现必须遵循。

```go
type NetworkManager interface {
    SetProxy(httpProxy, httpsProxy, noProxy string, dryRun bool) error
    ClearProxy(dryRun bool) error
    ReadProxy() (httpProxy, httpsProxy, noProxy string)
    ApplyHosts(profileName string, entries []config.HostsEntry, dryRun bool) error
    RemoveHosts(profileName string, dryRun bool) error
    ReadHostsBlocks() map[string][]config.HostsEntry
    SetDNS(servers []string, dryRun bool) error
    ReadDNS() []string
    CheckPermissions() error
    PlatformName() string
}
```

### Requirement: Windows 平台实现

系统 SHALL 支持通过 Windows 注册表和 netsh 命令管理系统网络配置。

#### Scenario: Windows 代理设置
- **WHEN** 用户在 Windows 上执行 `net-switch use company`
- **THEN** 通过注册表 `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings` 设置代理

#### Scenario: Windows hosts 修改
- **WHEN** 用户在 Windows 上切换 Profile
- **THEN** 修改 `C:\Windows\System32\drivers\etc\hosts`，使用与 Linux 相同的标记区块格式

#### Scenario: Windows DNS 设置
- **WHEN** 用户在 Windows 上设置 DNS
- **THEN** 通过 `netsh interface ip set dns` 命令设置

#### Scenario: Windows 权限检查
- **WHEN** 用户以非管理员身份运行
- **THEN** 提示需要管理员权限

### Requirement: macOS 平台实现

系统 SHALL 支持通过 networksetup 和 scutil 命令管理系统网络配置。

#### Scenario: macOS 代理设置
- **WHEN** 用户在 macOS 上执行 `net-switch use company`
- **THEN** 通过 `networksetup` 命令设置 Web Proxy 和 Secure Web Proxy

#### Scenario: macOS hosts 修改
- **WHEN** 用户在 macOS 上切换 Profile
- **THEN** 修改 `/etc/hosts`，使用与 Linux 相同的标记区块格式

#### Scenario: macOS DNS 设置
- **WHEN** 用户在 macOS 上设置 DNS
- **THEN** 通过 `networksetup -setdnsservers` 命令设置

#### Scenario: macOS 权限检查
- **WHEN** 用户以非 root 身份运行
- **THEN** 提示需要 sudo 权限

### Requirement: 平台自动识别

系统 SHALL 在启动时自动识别当前操作系统，创建对应的 Manager 实现。

#### Scenario: 自动识别
- **WHEN** 程序启动
- **THEN** 根据 `runtime.GOOS` 创建 `linuxManager`、`windowsManager` 或 `darwinManager`

## MODIFIED Requirements

### Requirement: 编排器（network.go）

将编排器从直接调用包级函数改为通过 `NetworkManager` 接口调用：

```go
func ApplyProfile(mgr NetworkManager, profile *config.Profile, oldProfileName string, dryRun bool) error
func RestoreAll(dryRun bool) error
func GetSystemStatus() map[string]interface{}
```

### Requirement: 权限检查（perm.go）

将 `IsRoot()` 和 `RequireRoot()` 移入各平台 Manager 的 `CheckPermissions()` 方法中。

### Requirement: CLI 集成

`use.go`、`status.go` 等命令通过工厂函数获取 Manager 后传入编排器。

## REMOVED Requirements

无
