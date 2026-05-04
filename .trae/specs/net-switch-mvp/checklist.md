# net-switch MVP Checklist

## 项目结构
- [x] `net-switch/go.mod` 存在且模块路径正确
- [x] `net-switch/cmd/net-switch/main.go` 存在
- [x] `net-switch/cmd/net-switch/root.go` 存在
- [x] `net-switch/cmd/net-switch/list.go` 存在
- [x] `net-switch/cmd/net-switch/use.go` 存在
- [x] `net-switch/cmd/net-switch/current.go` 存在
- [x] `net-switch/internal/config/config.go` 存在
- [x] `net-switch/internal/switcher/switcher.go` 存在
- [x] `net-switch/config.yaml` 示例文件存在

## CLI 功能
- [x] `net-switch list` 列出所有 Profile 名称和描述
- [x] `net-switch use <profile>` 切换到指定 Profile 并输出代理地址
- [x] `net-switch use nonexistent` 输出错误信息并列出可用 Profile
- [x] `net-switch current` 显示当前激活 Profile 和代理地址
- [x] `net-switch --help` 显示帮助信息

## 配置管理
- [x] 支持从当前目录读取 config.yaml
- [x] 支持从 ~/.net-switch/ 读取 config.yaml
- [x] Profile 数据结构包含 name、description、http_proxy、https_proxy

## 构建
- [x] `go build` 编译成功
- [x] `go vet` 无错误
