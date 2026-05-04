# GitHub 开源项目内容 Spec

## Why

net-switch 已完成完整的 CLI + GUI + 插件系统 + 商业功能实现，具备高质量开源发布的技术基础。但目前缺乏面向社区的项目文档和营销素材，无法有效吸引开发者关注和 Star 增长。需要一套专业的开源项目内容来提升项目的可见性和社区影响力。

## What Changes

- 新增 `README.md`：包含项目介绍、特性亮点、安装指南、快速开始、CLI/GUI 使用示例、架构图、贡献指南链接
- 新增 `README_zh.md`：中文版 README
- 新增 `.github/FUNDING.yml`：GitHub Sponsors 配置
- 新增 `.github/ISSUE_TEMPLATE/`：Bug 报告和功能请求模板
- 新增 `.github/pull_request_template.md`：PR 模板
- 新增 `CONTRIBUTING.md`：贡献指南
- 新增 `LICENSE`：MIT 许可证
- 新增 `.goreleaser.yml`：Go Release 配置（自动化发布）

## Impact

- Affected specs: 无代码变更，纯文档和社区模板
- Affected code: 项目根目录新增文件，不影响现有代码
- Affected `.github/` 目录：新增 Issue/PR 模板

---

## ADDED Requirements

### Requirement: README.md

项目 SHALL 提供一个高质量的英文 README.md，包含以下章节：

1. **Header**：Logo + 项目名 + 一句话描述 + 徽章（Go Version, License, Release, Stars）
2. **Why net-switch**：痛点描述 + 解决方案
3. **Features**：核心功能列表（带图标）
4. **Quick Start**：3 步快速上手
5. **Installation**：多平台安装方式（go install, brew, binary, Docker）
6. **CLI Usage**：常用命令示例
7. **GUI Preview**：截图/GIF 展示
8. **Configuration**：config.yaml 示例
9. **Plugin System**：插件开发简述
10. **Architecture**：简要架构图
11. **Comparison**：与 CC-Switch 对比表
12. **Contributing**：链接到 CONTRIBUTING.md
13. **License**：MIT

### Requirement: README_zh.md

项目 SHALL 提供中文版 README，内容与英文版对应。

### Requirement: 社区模板

项目 SHALL 提供标准的 GitHub 社区健康文件：
- Bug 报告模板（环境信息、复现步骤、预期行为）
- 功能请求模板（问题描述、期望方案、替代方案）
- PR 模板（变更描述、检查清单）

### Requirement: 发布文案

项目 SHALL 准备以下渠道的发布文案：
- Hacker News（Show HN 格式）
- Reddit（r/programming, r/golang, r/devops）
- Twitter/X（Thread 格式）
- V2EX / 掘金（中文社区）

### Requirement: Star 增长策略

项目 SHALL 制定可执行的 Star 增长策略，包括：
- 发布时间窗口
- 社区互动计划
- 内容营销路线
- SEO 优化要点

---

## MODIFIED Requirements

无。

## REMOVED Requirements

无。
