# Linux 网络操作模块 Checklist

- [x] Profile 结构包含 NoProxy、DNSConfig、HostsEntry 字段
- [x] config.yaml 示例已更新，包含 DNS 和 hosts 配置示例
- [x] 备份模块可正确备份文件到 ~/.net-switch/backups/
- [x] 备份模块可从备份目录恢复文件到原路径
- [x] 权限检查：非 root 用户执行时输出明确的 sudo 提示
- [x] 系统代理：/etc/environment 正确写入 http_proxy/https_proxy/no_proxy
- [x] 系统代理：切换到无代理 Profile 时正确清除代理变量
- [x] hosts 管理：使用标记区块格式正确写入 /etc/hosts
- [x] hosts 管理：切换 Profile 时先清理旧区块再写新区块
- [x] DNS 配置：正确写入 /etc/resolv.conf 的 nameserver
- [x] DNS 配置：systemd-resolved 检测并提示用户
- [x] 回滚：restore 命令可从最近备份恢复所有系统文件
- [x] dry-run 模式：输出操作预览但不修改任何文件
- [x] CLI：`--dry-run` 全局标志正常工作
- [x] CLI：restore 命令正常工作
- [x] CLI：status 命令显示当前系统代理/hosts/DNS 状态
- [x] `go build` 编译通过
- [x] `go vet` 无错误
