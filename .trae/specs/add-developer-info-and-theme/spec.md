# 开发者信息与主题切换 Spec

## Why
用户需要在 GUI 界面中看到开发者联系方式以便反馈问题，同时需要深色/浅色主题切换以提升使用体验。

## What Changes
- 在侧边栏底部添加开发者信息（姓名：吴棋，邮箱：wuqi173@outlook.com）
- 启用 Tailwind CSS dark mode（class 策略）
- 创建 ThemeContext 用于全局主题状态管理（持久化到 localStorage）
- 在"设置"标签页中添加主题切换 UI（浅色/深色/跟随系统）
- 为所有组件添加 `dark:` 变体类名，确保深色模式下视觉一致

## Impact
- Affected specs: 无前置依赖
- Affected code: `tailwind.config.js`, `index.css`, `App.tsx`, 所有 `components/*.tsx`, 新增 `contexts/ThemeContext.tsx`

## ADDED Requirements

### Requirement: 开发者信息展示
系统 SHALL 在侧边栏底部展示开发者姓名和邮箱，用户可通过邮箱链接直接联系开发者。

#### Scenario: 查看开发者信息
- **WHEN** 用户打开应用
- **THEN** 侧边栏底部显示"开发者：吴棋"和可点击的邮箱链接 "wuqi173@outlook.com"

### Requirement: 主题切换
系统 SHALL 提供浅色、深色、跟随系统三种主题选项，用户偏好持久化存储。

#### Scenario: 切换到深色主题
- **WHEN** 用户在设置页面选择"深色"主题
- **THEN** 应用整体切换为深色配色，偏好保存到 localStorage，刷新后保持

#### Scenario: 切换到浅色主题
- **WHEN** 用户在设置页面选择"浅色"主题
- **THEN** 应用恢复浅色配色

#### Scenario: 跟随系统主题
- **WHEN** 用户选择"跟随系统"
- **THEN** 应用主题随操作系统设置自动切换

## MODIFIED Requirements
### Requirement: 设置标签页
原"设置"标签页仅包含配置文件编辑器。现将其扩展为包含应用设置区域（主题切换）和配置文件编辑器两个部分。

## REMOVED Requirements
无
