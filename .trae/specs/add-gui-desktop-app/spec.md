# GUI 桌面应用 Spec

## Why

net-switch 目前仅提供 CLI 工具，目标用户群体中存在偏好图形界面的开发者。需要基于 Tauri + React 构建跨平台桌面应用，实现一键切换网络环境、可视化编辑配置等功能，为商业化发布做准备。

## What Changes

- 新增 `net-switch-gui/` 项目目录，包含 Tauri + React + Tailwind 前端
- Tauri 后端通过 Rust 调用 Go CLI 二进制（`net-switch`）执行系统操作
- 前端实现：Profile 列表与切换、当前状态展示、配置编辑器、日志查看
- 系统托盘集成：显示当前 Profile、快速切换菜单
- Tauri 打包配置：Windows (MSI)、macOS (DMG)、Linux (AppImage/deb)

## Impact

- Affected specs: net-switch-cross-platform（GUI 调用 CLI）
- Affected code: 新增 `net-switch-gui/` 目录

## ADDED Requirements

### Requirement: 主界面 - 环境概览

系统 SHALL 在主界面显示当前网络环境状态。

#### Scenario: 显示当前状态
- **WHEN** 用户打开应用
- **THEN** 显示当前 Profile 名称、代理地址、DNS 服务器、hosts 记录数量
- **THEN** 使用颜色指示器标识连接状态（绿色=已连接，灰色=无代理，黄色=警告）

#### Scenario: 显示 Profile 列表
- **WHEN** 用户打开应用
- **THEN** 左侧面板列出所有 Profile，当前激活的 Profile 高亮显示

### Requirement: 一键切换

系统 SHALL 支持通过点击按钮切换 Profile。

#### Scenario: 切换 Profile
- **WHEN** 用户点击 Profile 卡片上的"切换"按钮
- **THEN** 调用 `net-switch use <profile>` 执行切换
- **THEN** 显示执行进度和结果
- **THEN** 切换成功后更新界面状态

#### Scenario: dry-run 预览
- **WHEN** 用户右键 Profile 卡片选择"预览"
- **THEN** 调用 `net-switch use <profile> --dry-run` 显示将要执行的操作

### Requirement: 配置编辑

系统 SHALL 支持可视化编辑 YAML 配置文件。

#### Scenario: 编辑 Profile
- **WHEN** 用户点击"编辑配置"按钮
- **THEN** 打开表单编辑器，支持修改代理、DNS、hosts 等字段
- **THEN** 保存时写入 config.yaml 并验证格式

#### Scenario: 添加/删除 Profile
- **WHEN** 用户在编辑器中添加或删除 Profile
- **THEN** 更新 config.yaml 并刷新 Profile 列表

### Requirement: 日志查看

系统 SHALL 显示操作日志。

#### Scenario: 查看日志
- **WHEN** 用户切换到"日志"标签页
- **THEN** 显示最近的操作记录（时间、操作、结果）
- **THEN** 支持按级别筛选（info/warn/error）

### Requirement: 系统托盘

系统 SHALL 支持系统托盘集成。

#### Scenario: 托盘菜单
- **WHEN** 用户点击系统托盘图标
- **THEN** 显示当前 Profile 名称和所有可用 Profile 列表
- **THEN** 点击 Profile 名称直接切换

## MODIFIED Requirements

无

## REMOVED Requirements

无
