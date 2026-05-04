# 商业级功能增强 Checklist

## 插件系统
- [x] Plugin 接口定义完整（Manifest, PluginContext, ExecutionContext）
- [x] EventBus 事件总线可正常发布和订阅事件
- [x] Registry 可注册、查询、启用/禁用插件
- [x] Loader 可从目录自动扫描并加载插件
- [x] 依赖关系解析正确（DAG 排序无循环依赖）
- [x] 插件可注册自定义 CLI 子命令
- [x] 插件配置从 config.yaml 正确注入
- [x] 插件生命周期钩子（Init/Validate/Apply/Rollback/Cleanup）按序调用
- [x] echo-plugin 示例可正常加载和执行
- [x] 插件单元测试覆盖率 ≥ 80%

## 配置加密
- [x] AES-256-GCM 加密/解密正确性验证
- [x] PBKDF2 密钥派生输出稳定且符合预期
- [x] EncryptedContainer 可正确序列化/反序列化
- [x] 字段级加密标记 `${encrypted:...}` 可正确解析和替换
- [x] 加密配置文件可正常加载
- [x] `net-switch encrypt` / `net-switch decrypt` 命令工作正常
- [x] 主密钥设置/修改命令工作正常
- [x] 错误口令时解密失败并给出明确提示
- [x] 加密模块单元测试覆盖率 ≥ 80%

## 自动规则引擎
- [x] RuleSet/Rule/Trigger/Action 数据结构定义正确
- [x] 域名匹配支持 glob（*.github.com）和正则表达式
- [x] IP/CIDR 匹配正确（10.0.0.0/8 等）
- [x] WiFi SSID 触发器跨平台实现（Win/Mac/Linux）
- [x] 规则按 priority 排序匹配
- [x] 冷却机制正确（cooldown 间隔内不重复触发）
- [x] `net-switch rules list` / `rules test` / `rules enable/disable` 命令工作正常
- [x] 规则配置文件 `rules.yaml` 可正确解析
- [x] 规则引擎单元测试覆盖率 ≥ 80%

## Kubernetes 插件
- [x] kubeconfig 文件可正确解析
- [x] K8s context 列表、当前、切换功能正常
- [x] Namespace 切换功能正常
- [x] Profile 切换时自动应用 K8s context 映射
- [x] `net-switch k8s list/current/switch/ns` 命令工作正常
- [x] K8s 插件集成测试通过（12 个测试用例）

## 团队同步
- [x] 同步客户端可正确发送拉取/推送请求
- [x] 增量同步协议正确（仅传输变更部分）
- [x] 配置合并逻辑正确（remote_wins/local_wins/merge_profiles 策略）
- [x] 冲突解决策略正确（remote_wins/local_wins/ask）
- [x] 配置签名验证通过
- [x] `net-switch sync pull/push` 命令工作正常
- [x] 同步模块单元测试覆盖率 ≥ 80%（10 个测试用例）

## 登录系统
- [x] OAuth2 授权码流程可正常完成（含 PKCE 支持）
- [x] Token 可正确存储到 OS Keychain（文件后备实现）
- [x] Token 刷新机制正常（access_token 过期时自动 refresh）
- [x] 离线模式正常工作（无网络时使用缓存 Token）
- [x] `net-switch auth login/logout` 命令工作正常

## 商业授权
- [x] License Key 可正确解析
- [x] 设备指纹生成稳定（同一设备多次生成结果一致）
- [x] 在线验证流程正常
- [x] 离线缓存宽限期机制正确（30 天）
- [x] 功能开关根据 License 正确启用/禁用功能
- [x] 过期 License 时提示续期

## GUI 集成
- [x] 团队同步配置页面可正常显示和操作
- [x] 规则编辑器可可视化创建/编辑规则
- [x] 插件管理页面可显示已安装插件列表和状态
- [x] 加密配置管理界面可设置口令和加密/解密
- [x] License 激活页面可输入 Key 并验证

## 架构质量
- [x] 所有模块通过 `go vet` 检查
- [ ] 所有模块通过 `golangci-lint` 检查（未安装 golangci-lint）
- [x] 核心模块测试通过（53 个测试用例，5 个测试包）
- [x] 无循环依赖
- [x] 配置文件向后兼容（LoadConfig 保持原签名，非加密配置正常工作）
