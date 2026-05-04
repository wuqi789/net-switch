# net-switch 最小可用版本（MVP）规格文档

## Why

开发者在日常工作中需要频繁切换网络代理环境（公司内网/VPN/测试环境/直连），手动设置 HTTP_PROXY/HTTPS_PROXY 环境变量繁琐且容易出错。需要一个轻量级 CLI 工具，通过 YAML 配置文件管理多套网络环境 Profile，实现一键切换。

## What Changes

- 新建独立 Go 项目 `net-switch`（独立于之前的 netenv 全功能版本）
- 实现基于 Cobra 的 3 个 CLI 命令：`list`、`use`、`current`
- 实现 YAML 配置文件解析，支持多 Profile 定义
- 实现环境变量切换（HTTP_PROXY、HTTPS_PROXY）
- 提供 config.yaml 示例配置文件

## Impact

- Affected specs: 全新项目
- Affected code: 全新代码库 `net-switch/`

## ADDED Requirements

### Requirement: CLI 框架

系统 SHALL 提供基于 Cobra 的 CLI 工具 `net-switch`，支持以下命令：

#### Scenario: 显示帮助
- **WHEN** 用户执行 `net-switch --help`
- **THEN** 显示所有可用命令列表

### Requirement: Profile 列表展示

#### Scenario: 列出所有 Profile
- **WHEN** 用户执行 `net-switch list`
- **THEN** 显示所有已定义的 Profile 名称和描述

### Requirement: 切换网络环境

#### Scenario: 切换到指定 Profile
- **WHEN** 用户执行 `net-switch use <profile-name>`
- **THEN** 系统设置 HTTP_PROXY 和 HTTPS_PROXY 环境变量，并输出切换成功信息和当前代理地址

#### Scenario: 切换到不存在的 Profile
- **WHEN** 用户执行 `net-switch use nonexistent`
- **THEN** 系统输出错误信息并列出可用 Profile

### Requirement: 显示当前状态

#### Scenario: 显示当前 Profile
- **WHEN** 用户执行 `net-switch current`
- **THEN** 显示当前激活的 Profile 名称及代理地址

#### Scenario: 无激活 Profile
- **WHEN** 用户执行 `net-switch current` 且无激活 Profile
- **THEN** 提示用户当前无激活 Profile

### Requirement: 配置文件

系统 SHALL 读取 YAML 格式的配置文件，支持定义多个 Profile，每个 Profile 包含 name、description、http_proxy、https_proxy 字段。

配置文件搜索路径优先级：
1. 当前目录 `config.yaml`
2. `~/.net-switch/config.yaml`

## MODIFIED Requirements

无（全新项目）

## REMOVED Requirements

无（全新项目）
