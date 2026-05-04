# Tasks

## Task 1: 初始化 Go 项目结构
- [x] SubTask 1.1: 创建 `net-switch/` 目录
- [x] SubTask 1.2: 创建 `go.mod`（模块路径 `github.com/netenv/net-switch`）
- [x] SubTask 1.3: 安装依赖（cobra、yaml.v3）

## Task 2: 实现配置管理模块
- [x] SubTask 2.1: 创建 `internal/config/config.go`，定义 Config/Profile 结构体
- [x] SubTask 2.2: 实现 YAML 配置文件加载（支持当前目录和 ~/.net-switch/ 路径）
- [x] SubTask 2.3: 实现 GetProfile(name)、ListProfiles()、GetCurrentProfile() 方法
- [x] SubTask 2.4: 实现 SetCurrentProfile(name) 持久化当前激活 Profile
- [x] SubTask 2.5: 创建 `config.yaml` 示例文件

## Task 3: 实现环境变量切换模块
- [x] SubTask 3.1: 创建 `internal/switcher/switcher.go`
- [x] SubTask 3.2: 实现 Switch(profile) 设置 HTTP_PROXY/HTTPS_PROXY 环境变量
- [x] SubTask 3.3: 实现 GetCurrentStatus() 获取当前环境变量状态

## Task 4: 搭建 CLI 命令
- [x] SubTask 4.1: 创建 `cmd/net-switch/main.go` 程序入口
- [x] SubTask 4.2: 创建 `cmd/net-switch/root.go` 定义 root 命令和全局标志
- [x] SubTask 4.3: 创建 `cmd/net-switch/list.go` 实现 list 命令
- [x] SubTask 4.4: 创建 `cmd/net-switch/use.go` 实现 use 命令
- [x] SubTask 4.5: 创建 `cmd/net-switch/current.go` 实现 current 命令

## Task 5: 构建验证
- [x] SubTask 5.1: 执行 `go build` 确认编译通过
- [x] SubTask 5.2: 执行 `go vet` 确认无错误

# Task Dependencies
- Task 1 无依赖
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1
- Task 4 依赖 Task 2、Task 3
- Task 5 依赖 Task 4

**可并行执行**：Task 2 和 Task 3
