# GitHub 开源项目内容 Checklist

## LICENSE
- [x] MIT License 文件存在且格式正确
- [x] 版权年份为 2024-2026
- [x] 版权主体为 netenv

## 社区模板
- [x] Bug Report 模板包含环境信息、复现步骤、预期行为字段
- [x] Feature Request 模板包含问题描述、期望方案、替代方案字段
- [x] PR 模板包含变更描述和检查清单
- [x] FUNDING.yml 配置正确

## CONTRIBUTING.md
- [x] 开发环境搭建步骤清晰（Go 版本、依赖安装）
- [x] 代码规范明确（gofmt、go vet、命名规范）
- [x] 提交规范明确（Conventional Commits）
- [x] PR 流程完整（Fork → Branch → PR → Review → Merge）
- [x] 插件开发指南包含接口说明和示例

## README.md
- [x] Header 区域包含项目名、描述、Go/Release/License 徽章
- [x] "Why" 章节清晰描述痛点和解决方案
- [x] Features 列表覆盖所有核心功能（CLI/GUI/插件/加密/规则/K8s/同步）
- [x] Quick Start 3 步内可完成（安装 → 初始化 → 切换）
- [x] Installation 覆盖 go install、brew、二进制下载、Docker
- [x] CLI Usage 包含 10+ 常用命令示例
- [x] GUI 截图展示（建议 GIF）
- [x] Configuration 包含完整 config.yaml 示例
- [x] Plugin System 包含接口概要和示例
- [x] Architecture 包含 ASCII 架构图
- [x] Comparison 表与 CC-Switch 对比（功能、平台、扩展性、配置格式）
- [x] Contributing 章节链接到 CONTRIBUTING.md
- [x] License 章节引用 MIT

## README_zh.md
- [x] 中文版结构与英文版完全一致
- [x] 翻译准确、符合中文技术文档习惯
- [x] 所有代码示例保持英文原样

## .goreleaser.yml
- [x] 支持 darwin/linux/windows 三平台
- [x] 支持 amd64/arm64 双架构
- [x] Archive 格式正确（tar.gz + zip）
- [x] Changelog 自动生成配置

## 发布文案
- [x] Hacker News "Show HN" 文案 ≤ 400 词，突出技术亮点
- [x] Reddit 文案适配 r/programming、r/golang、r/devops 三个子版
- [x] Twitter/X Thread 5-8 条推文，含项目链接和截图
- [x] V2EX / 掘金中文文案，符合社区风格

## Star 增长策略
- [x] 发布时间窗口建议（美东时间周二/周三上午）
- [x] 社区互动计划（Issues、Discussions、回复策略）
- [x] 内容营销路线图（Blog、视频、对比文章）
- [x] 动图/截图制作建议（工具、尺寸、内容）

## 整体质量
- [ ] 所有文档无拼写错误
- [ ] 所有链接可访问
- [ ] 徽章链接指向正确的 URL
- [ ] 代码示例可直接复制运行
