import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { PluginInfo } from "../types";

const FEATURES = [
  {
    icon: "📋",
    title: "列出 Context",
    desc: "查看 kubeconfig 中所有可用的 Kubernetes 集群上下文，标识当前活跃的 context。",
  },
  {
    icon: "🔄",
    title: "切换 Context",
    desc: "一键切换 kubectl 指向的目标集群，支持 prod、staging、minikube 等多集群管理。",
  },
  {
    icon: "📦",
    title: "命名空间管理",
    desc: "设置当前 context 的默认 namespace，免去每次 kubectl 命令加 -n 参数的麻烦。",
  },
  {
    icon: "🔗",
    title: "Profile 联动",
    desc: "配置 context_map 后，切换网络环境时自动切换对应的 K8s context 和 namespace。",
  },
];

const LIFECYCLE = [
  { phase: "Init", when: "插件加载", desc: "读取 kubeconfig 路径、context_map 和 auto_switch 配置" },
  { phase: "Validate", when: "切换前", desc: "校验 profile 对应的 context 映射是否存在" },
  { phase: "Apply", when: "切换中", desc: "自动切换 K8s context 和 namespace" },
  { phase: "Rollback", when: "失败时", desc: "记录错误日志，保留原 context 不变" },
  { phase: "Cleanup", when: "卸载时", desc: "释放资源" },
];

export default function PluginManager() {
  const [plugin, setPlugin] = useState<PluginInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPlugin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<string>("list_plugins");
      const data = JSON.parse(result) as PluginInfo[];
      const k8s = data.find((p) => p.name.includes("k8s")) ?? data[0] ?? null;
      setPlugin(k8s);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlugin();
  }, []);

  const handleToggle = async () => {
    if (!plugin) return;
    const newEnabled = !plugin.enabled;
    try {
      await invoke("toggle_plugin", { name: plugin.name, enabled: newEnabled });
      setPlugin({ ...plugin, enabled: newEnabled });
    } catch (e) {
      setError(String(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">插件管理</h3>
        <button
          onClick={loadPlugin}
          disabled={loading}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "加载中..." : "刷新"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {!plugin && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">暂无已安装的插件</p>
        </div>
      )}

      {plugin && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {plugin.name}
                </h4>
                <span className="text-xs px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                  v{plugin.version}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    plugin.enabled
                      ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {plugin.enabled ? "已启用" : "已禁用"}
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                作者: {plugin.author}
              </div>
            </div>
            <button
              onClick={handleToggle}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                plugin.enabled ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  plugin.enabled ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
            {plugin.description ||
              "Kubernetes 上下文和命名空间管理插件。在网络环境切换时自动同步 kubectl 的目标集群和命名空间，支持多集群无缝切换。"}
          </p>

          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">核心功能</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                >
                  <span className="text-lg shrink-0">{f.icon}</span>
                  <div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-100">
                      {f.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                      {f.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              插件生命周期
            </h5>
            <div className="flex items-start gap-0 overflow-x-auto">
              {LIFECYCLE.map((step, i) => (
                <div key={step.phase} className="flex items-start shrink-0">
                  <div className="flex flex-col items-center w-28">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 flex items-center justify-center text-xs font-bold mb-1">
                      {i + 1}
                    </div>
                    <div className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                      {step.phase}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                      {step.when}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 text-center leading-tight px-1">
                      {step.desc}
                    </div>
                  </div>
                  {i < LIFECYCLE.length - 1 && (
                    <div className="w-4 h-px bg-gray-300 dark:bg-gray-600 mt-4 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">权限</h5>
              <div className="flex flex-wrap gap-1.5">
                {plugin.permissions.length > 0 ? (
                  plugin.permissions.map((perm) => (
                    <span
                      key={perm}
                      className="text-xs px-2.5 py-1 rounded bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border border-yellow-100 dark:border-yellow-800"
                    >
                      {perm}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">无额外权限</span>
                )}
              </div>
            </div>
            <div>
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">命令</h5>
              <div className="flex flex-wrap gap-1.5">
                {plugin.commands.length > 0 ? (
                  plugin.commands.map((cmd) => (
                    <span
                      key={cmd}
                      className="text-xs px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-mono border border-blue-100 dark:border-blue-800"
                    >
                      {cmd}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500">无命令</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
