# Tasks

## Task 1: 定义 NetworkManager 接口
- [x] SubTask 1.1: 在 `internal/network/manager.go` 中定义 `NetworkManager` 接口
- [x] SubTask 1.2: 接口方法：SetProxy、ClearProxy、ReadProxy、ApplyHosts、RemoveHosts、ReadHostsBlocks、SetDNS、ReadDNS、CheckPermissions、PlatformName

## Task 2: 重构 Linux 实现为 linuxManager
- [x] SubTask 2.1: 创建 `internal/network/linux.go`
- [x] SubTask 2.2: 将 proxy.go、hosts.go、dns.go 中的函数包装为 `linuxManager` 结构体方法
- [x] SubTask 2.3: 删除旧的 proxy.go、hosts.go、dns.go、perm.go
- [x] SubTask 2.4: 确保 `go build` 通过

## Task 3: 实现 Windows 平台 manager
- [x] SubTask 3.1: 创建 `internal/network/windows.go`
- [x] SubTask 3.2: 实现代理设置（注册表 `HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings`）
- [x] SubTask 3.3: 实现 hosts 修改（`C:\Windows\System32\drivers\etc\hosts`，标记区块格式）
- [x] SubTask 3.4: 实现 DNS 设置（`netsh interface ip set dns`）
- [x] SubTask 3.5: 实现权限检查（管理员检测）

## Task 4: 实现 macOS 平台 manager
- [x] SubTask 4.1: 创建 `internal/network/darwin.go`
- [x] SubTask 4.2: 实现代理设置（`networksetup -setwebproxy` / `-setsecurewebproxy`）
- [x] SubTask 4.3: 实现 hosts 修改（`/etc/hosts`，标记区块格式）
- [x] SubTask 4.4: 实现 DNS 设置（`networksetup -setdnsservers`）
- [x] SubTask 4.5: 实现权限检查（os.Getuid() == 0）

## Task 5: 工厂函数与编排器适配
- [x] SubTask 5.1: 在各平台 factory_*.go 中实现 `NewManager() NetworkManager` 工厂函数
- [x] SubTask 5.2: 修改 `internal/network/network.go` 编排器，接收 `NetworkManager` 参数
- [x] SubTask 5.3: 修改 `cmd/net-switch/use.go`、`status.go`、`restore.go` 通过工厂获取 Manager

## Task 6: 构建验证
- [x] SubTask 6.1: `go build` 编译通过（Windows 环境）
- [x] SubTask 6.2: `go vet` 无错误

# Task Dependencies
- Task 1 无依赖
- Task 2 依赖 Task 1
- Task 3 依赖 Task 1
- Task 4 依赖 Task 1
- Task 5 依赖 Task 2、Task 3、Task 4
- Task 6 依赖 Task 5

**可并行执行**：Task 2、Task 3、Task 4
