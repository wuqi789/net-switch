# Linux 系统网络操作模块 Spec

## Why

当前 net-switch MVP 仅能修改当前进程的环境变量（HTTP_PROXY/HTTPS_PROXY），无法真正影响系统级网络配置。开发者需要工具能够直接操作 /etc/hosts、系统代理、DNS 等底层网络配置，并且必须支持回滚以避免破坏系统。

## What Changes

- 新增 `internal/network` 包，封装 Linux 系统网络操作
- 新增 `internal/backup` 包，实现配置文件备份与回滚
- 扩展 `config.yaml` Profile 结构，新增 `dns` 和 `hosts` 字段
- 新增 CLI 命令 `net-switch restore` 用于回滚
- 新增 `--dry-run` 全局标志，预览模式只打印不执行
- 所有系统文件操作需要 root 权限检查

## Impact

- Affected specs: net-switch-mvp（扩展 Profile 结构和 CLI）
- Affected code: `net-switch/internal/`、`net-switch/cmd/net-switch/`、`net-switch/config.yaml`

## ADDED Requirements

### Requirement: 系统代理设置

系统 SHALL 支持修改 Linux 系统级代理配置。

#### Scenario: 设置系统代理
- **WHEN** 用户执行 `net-switch use company` 且 Profile 包含代理配置
- **THEN** 系统写入 /etc/environment 中的 http_proxy/https_proxy/no_proxy 变量

#### Scenario: 清除系统代理
- **WHEN** 用户切换到无代理 Profile（http_proxy 为空）
- **THEN** 系统从 /etc/environment 中移除代理相关变量

### Requirement: hosts 文件管理

系统 SHALL 支持修改 /etc/hosts 文件，使用标记区块管理条目。

#### Scenario: 添加 hosts 条目
- **WHEN** Profile 包含 hosts 配置
- **THEN** 在 /etc/hosts 中插入标记区块 `# net-switch:begin:<profile>` 到 `# net-switch:end:<profile>`

#### Scenario: 切换 Profile 时清理旧条目
- **WHEN** 切换到新 Profile
- **THEN** 先移除旧 Profile 的标记区块，再插入新区块

### Requirement: DNS 配置

系统 SHALL 支持修改 /etc/resolv.conf 设置 DNS 服务器。

#### Scenario: 设置 DNS
- **WHEN** Profile 包含 dns 配置
- **THEN** 备份原 /etc/resolv.conf 后写入新的 nameserver 条目

#### Scenario: 恢复 DNS
- **WHEN** 用户执行 `net-switch restore`
- **THEN** 从备份恢复原始 /etc/resolv.conf

### Requirement: 备份与回滚

系统 SHALL 在每次修改系统文件前自动备份，并支持一键回滚。

#### Scenario: 自动备份
- **WHEN** 任何系统文件将被修改
- **THEN** 先将原文件备份到 `~/.net-switch/backups/` 目录（带时间戳）

#### Scenario: 一键回滚
- **WHEN** 用户执行 `net-switch restore`
- **THEN** 从最近的备份恢复所有被修改的系统文件

### Requirement: 权限检查

系统 SHALL 在执行需要 root 权限的操作前检查权限。

#### Scenario: 权限不足
- **WHEN** 用户以非 root 身份执行需要权限的操作
- **THEN** 输出错误信息提示需要 sudo 权限

### Requirement: Dry-Run 模式

系统 SHALL 支持 dry-run 模式，只预览将要执行的操作而不实际执行。

#### Scenario: dry-run 预览
- **WHEN** 用户执行 `net-switch use company --dry-run`
- **THEN** 输出所有将要执行的文件操作（读/写/备份），但不实际修改任何文件

## MODIFIED Requirements

### Requirement: Profile 数据结构

扩展 Profile 结构，新增 DNS 和 hosts 配置：

```yaml
profiles:
  - name: company
    description: "公司内网"
    http_proxy: "http://proxy.company.com:8080"
    https_proxy: "http://proxy.company.com:8080"
    no_proxy: "localhost,127.0.0.1,.company.com"
    dns:
      servers:
        - "10.0.0.1"
        - "10.0.0.2"
    hosts:
      - ip: "10.0.1.100"
        hostname: "api.company.com"
      - ip: "10.0.1.101"
        hostname: "db.company.com"
```

## REMOVED Requirements

无
