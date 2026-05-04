# Tasks

## Phase 1: 项目基础文件

- [x] Task 1: 创建 LICENSE 文件
  - [x] SubTask 1.1: 创建 MIT License 文件
  - [x] SubTask 1.2: 确认版权信息和年份

- [x] Task 2: 创建 GitHub 社区模板
  - [x] SubTask 2.1: 创建 `.github/ISSUE_TEMPLATE/bug_report.md`
  - [x] SubTask 2.2: 创建 `.github/ISSUE_TEMPLATE/feature_request.md`
  - [x] SubTask 2.3: 创建 `.github/pull_request_template.md`
  - [x] SubTask 2.4: 创建 `.github/FUNDING.yml`

- [x] Task 3: 创建 CONTRIBUTING.md
  - [x] SubTask 3.1: 开发环境搭建指南
  - [x] SubTask 3.2: 代码规范和提交规范
  - [x] SubTask 3.3: PR 流程说明
  - [x] SubTask 3.4: 插件开发指南

## Phase 2: README 核心内容

- [x] Task 4: 创建 README.md（英文版）
  - [x] SubTask 4.1: Header 区域（Logo/徽章/一句话描述）
  - [x] SubTask 4.2: Why net-switch（痛点 + 解决方案）
  - [x] SubTask 4.3: Features 功能列表
  - [x] SubTask 4.4: Quick Start 快速上手
  - [x] SubTask 4.5: Installation 安装指南（多平台）
  - [x] SubTask 4.6: CLI Usage 命令示例
  - [x] SubTask 4.7: GUI Preview 截图展示
  - [x] SubTask 4.8: Configuration 配置示例
  - [x] SubTask 4.9: Plugin System 插件说明
  - [x] SubTask 4.10: Architecture 架构图（ASCII）
  - [x] SubTask 4.11: Comparison 对比表（vs CC-Switch）
  - [x] SubTask 4.12: Contributing / License 章节

- [x] Task 5: 创建 README_zh.md（中文版）
  - [x] SubTask 5.1: 完整中文翻译，保持结构一致

## Phase 3: 发布配置

- [x] Task 6: 创建 .goreleaser.yml
  - [x] SubTask 6.1: 多平台构建配置（Windows/macOS/Linux）
  - [x] SubTask 6.2: Archive 命名规则
  - [x] SubTask 6.3: Changelog 生成配置

## Phase 4: 发布文案与策略

- [x] Task 7: 撰写发布文案
  - [x] SubTask 7.1: Hacker News "Show HN" 文案
  - [x] SubTask 7.2: Reddit 发布文案（r/programming, r/golang, r/devops）
  - [x] SubTask 7.3: Twitter/X Thread 文案
  - [x] SubTask 7.4: V2EX / 掘金中文发布文案

- [x] Task 8: 制定 Star 增长策略文档
  - [x] SubTask 8.1: 发布时间窗口分析
  - [x] SubTask 8.2: 社区互动计划
  - [x] SubTask 8.3: 内容营销路线图
  - [x] SubTask 8.4: 动图/截图制作建议

# Task Dependencies

- Task 1、Task 2、Task 3 可并行
- Task 4 依赖 Task 1（需要 LICENSE 引用）
- Task 5 依赖 Task 4（结构对齐）
- Task 6 独立
- Task 7、Task 8 依赖 Task 4（需要 README 内容参考）

**可并行执行**：
- Phase 1（Task 1-3）全部可并行
- Task 6 可与 Phase 1 并行
