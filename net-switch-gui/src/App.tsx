import { useEffect, useState } from "react";
import { useNetSwitch } from "./hooks/useNetSwitch";
import StatusPanel from "./components/StatusPanel";
import ProfileList from "./components/ProfileList";
import LogViewer from "./components/LogViewer";
import ConfigEditor from "./components/ConfigEditor";
import SyncPanel from "./components/SyncPanel";
import RuleEditor from "./components/RuleEditor";
import PluginManager from "./components/PluginManager";
import EncryptConfig from "./components/EncryptConfig";

type Tab = "overview" | "logs" | "config" | "sync" | "rules" | "plugins" | "security";

export default function App() {
  const [tab, setTab] = useState<Tab>("overview");
  const {
    profiles,
    current,
    status,
    loading,
    error,
    logs,
    switchProfile,
    dryRunSwitch,
    refreshAll,
    initWithDefault,
    clearError,
  } = useNetSwitch();

  useEffect(() => {
    initWithDefault();
  }, [initWithDefault]);

  const navItems: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "概览", icon: "◉" },
    { id: "logs", label: "日志", icon: "☰" },
    { id: "config", label: "设置", icon: "⚙" },
    { id: "sync", label: "团队同步", icon: "↻" },
    { id: "rules", label: "自动规则", icon: "⚡" },
    { id: "plugins", label: "插件", icon: "🧩" },
    { id: "security", label: "安全", icon: "🔒" },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <aside className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">NetSwitch</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">网络环境切换工具</p>
        </div>

        <nav className="flex-1 p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                tab === item.id
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-4">
            {current?.current_profile ? (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {current.current_profile}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">当前环境</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <div className="text-sm text-gray-500 dark:text-gray-400">未设置环境</div>
              </div>
            )}
          </div>
          <div className="px-4 pb-3">
            <div className="text-[11px] text-gray-400 dark:text-gray-500">
              开发者：吴棋
            </div>
            <a
              href="mailto:wuqi173@outlook.com"
              className="text-[11px] text-blue-500 dark:text-blue-400 hover:underline"
            >
              wuqi173@outlook.com
            </a>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {tab === "overview" && "网络环境概览"}
              {tab === "logs" && "操作日志"}
              {tab === "config" && "设置"}
              {tab === "sync" && "团队同步"}
              {tab === "rules" && "自动规则"}
              {tab === "plugins" && "插件管理"}
              {tab === "security" && "安全设置"}
            </h2>
            <button
              onClick={refreshAll}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "刷新中..." : "刷新"}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              <button
                onClick={clearError}
                className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
              >
                ✕
              </button>
            </div>
          )}

          {tab === "overview" && (
            <div className="space-y-6">
              <StatusPanel status={status} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  环境 Profile
                </h3>
                <ProfileList
                  profiles={profiles}
                  currentName={current?.current_profile || ""}
                  loading={loading}
                  onSwitch={switchProfile}
                  onDryRun={dryRunSwitch}
                />
              </div>
            </div>
          )}

          {tab === "logs" && <LogViewer logs={logs} />}

          {tab === "config" && <ConfigEditor onSave={refreshAll} />}

          {tab === "sync" && <SyncPanel />}

          {tab === "rules" && <RuleEditor />}

          {tab === "plugins" && <PluginManager />}

          {tab === "security" && <EncryptConfig />}
        </div>
      </main>
    </div>
  );
}
