# Tasks

## Task 1: 扩展 Profile 数据结构
- [x] SubTask 1.1: 扩展 `internal/config/config.go` 中的 Profile 结构，新增 NoProxy、DNSConfig、HostsEntry 字段
- [x] SubTask 1.2: 新增 DNSConfig 结构体（Servers []string）
- [x] SubTask 1.3: 新增 HostsEntry 结构体（IP、Hostname）
- [x] SubTask 1.4: 更新 config.yaml 示例，添加 DNS 和 hosts 字段

## Task 2: 实现备份管理模块
- [x] SubTask 2.1: 创建 `internal/backup/backup.go`
- [x] SubTask 2.2: 实现 Backup 结构体（原路径、备份路径、时间戳）
- [x] SubTask 2.3: 实现 BackupFile(srcPath, tag) 函数 - 将文件备份到 ~/.net-switch/backups/<timestamp>_<tag>/ 目录
- [x] SubTask 2.4: 实现 Restore(backupDir) 函数 - 从备份目录恢复所有文件到原路径
- [x] SubTask 2.5: 实现 ListBackups() 函数 - 列出所有备份
- [x] SubTask 2.6: 实现 GetLatestBackup() 函数 - 获取最近一次备份

## Task 3: 实现权限检查模块
- [x] SubTask 3.1: 创建 `internal/network/perm.go`
- [x] SubTask 3.2: 实现 IsRoot() 检查（通过 os.Getuid() == 0）
- [x] SubTask 3.3: 实现 RequireRoot() error - 非 root 时返回错误并提示使用 sudo

## Task 4: 实现系统代理操作
- [x] SubTask 4.1: 创建 `internal/network/proxy.go`
- [x] SubTask 4.2: 实现 SetSystemProxy(httpProxy, httpsProxy, noProxy, dryRun) - 修改 /etc/environment 文件
- [x] SubTask 4.3: 实现 ClearSystemProxy(dryRun) - 从 /etc/environment 移除代理变量
- [x] SubTask 4.4: 读取现有 /etc/environment，仅修改/追加代理相关行，保留其他配置

## Task 5: 实现 hosts 文件操作
- [x] SubTask 5.1: 创建 `internal/network/hosts.go`
- [x] SubTask 5.2: 实现 ApplyHosts(profileName, entries []HostsEntry, dryRun) - 写入标记区块
- [x] SubTask 5.3: 实现 RemoveHosts(profileName, dryRun) - 移除指定 Profile 的标记区块
- [x] SubTask 5.4: 标记格式：`# net-switch:begin:<profile>` / `# net-switch:end:<profile>`

## Task 6: 实现 DNS 配置操作
- [x] SubTask 6.1: 创建 `internal/network/dns.go`
- [x] SubTask 6.2: 实现 SetDNS(servers []string, dryRun) - 写入 /etc/resolv.conf
- [x] SubTask 6.3: 实现 RestoreDNS(dryRun) - 从备份恢复 /etc/resolv.conf
- [x] SubTask 6.4: 写入前检查是否有 systemd-resolved 运行，如有则提示用户

## Task 7: 实现网络操作编排器
- [x] SubTask 7.1: 创建 `internal/network/network.go` 作为统一入口
- [x] SubTask 7.2: 实现 ApplyProfile(profile, oldProfileName, dryRun) - 编排所有操作
- [x] SubTask 7.3: 流程：权限检查 → 备份 → hosts（清理旧+写新）→ DNS → 代理 → 完成

## Task 8: 集成到 CLI
- [x] SubTask 8.1: 修改 `cmd/net-switch/root.go` 添加 `--dry-run` 全局标志
- [x] SubTask 8.2: 修改 `cmd/net-switch/use.go` 调用 network.ApplyProfile
- [x] SubTask 8.3: 新建 `cmd/net-switch/restore.go` 实现 restore 命令
- [x] SubTask 8.4: 新建 `cmd/net-switch/status.go` 显示当前系统代理/hosts/DNS 状态

## Task 9: 构建验证
- [x] SubTask 9.1: `go build` 编译通过
- [x] SubTask 9.2: `go vet` 无错误

# Task Dependencies
- Task 1 无依赖
- Task 2 无依赖
- Task 3 无依赖
- Task 4 依赖 Task 1、Task 2、Task 3
- Task 5 依赖 Task 1、Task 2、Task 3
- Task 6 依赖 Task 1、Task 2、Task 3
- Task 7 依赖 Task 4、Task 5、Task 6
- Task 8 依赖 Task 7
- Task 9 依赖 Task 8

**可并行执行**：Task 1、Task 2、Task 3；Task 4、Task 5、Task 6
