# 跨平台网络管理模块 Checklist

- [x] NetworkManager 接口定义完整（10 个方法）
- [x] linuxManager 实现所有接口方法
- [x] windowsManager 实现所有接口方法
- [x] darwinManager 实现所有接口方法
- [x] 工厂函数根据 runtime.GOOS 返回正确实现
- [x] 编排器通过接口调用，不直接依赖具体实现
- [x] Windows 代理通过注册表设置
- [x] Windows hosts 使用标记区块格式
- [x] Windows DNS 通过 netsh 命令设置
- [x] macOS 代理通过 networksetup 设置
- [x] macOS hosts 使用标记区块格式
- [x] macOS DNS 通过 networksetup 设置
- [x] CLI 命令正确使用工厂获取 Manager
- [x] `go build` 编译通过
- [x] `go vet` 无错误
