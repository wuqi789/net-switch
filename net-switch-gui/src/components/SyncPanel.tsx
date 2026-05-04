import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { SyncStatus, SyncConfigData } from "../types";

const conflictModes = [
  { value: "remote_wins", label: "远程优先", desc: "远程配置覆盖本地" },
  { value: "local_wins", label: "本地优先", desc: "本地配置覆盖远程" },
  { value: "merge_profiles", label: "智能合并", desc: "按名称合并配置" },
];

const statusMap: Record<string, { label: string; color: string }> = {
  ready: { label: "就绪", color: "bg-green-500" },
  not_configured: { label: "未配置", color: "bg-yellow-500" },
  error: { label: "错误", color: "bg-red-500" },
};

const emptyConfig: SyncConfigData = {
  team_id: "",
  team_name: "",
  server_url: "",
  auth_token: "",
  conflict_mode: "remote_wins",
  auto_pull: true,
  pull_interval: "5m",
};

export default function SyncPanel() {
  const [status, setStatus] = useState<SyncStatus | null>(null);
  const [syncConfig, setSyncConfig] = useState<SyncConfigData | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [configForm, setConfigForm] = useState<SyncConfigData>({ ...emptyConfig });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pulling, setPulling] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const loadSyncStatus = useCallback(async () => {
    try {
      const result = await invoke<string>("sync_status");
      const data = JSON.parse(result) as SyncStatus;
      setStatus(data);
    } catch (e) {
      setError(String(e));
    }
  }, []);

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true);
      clearMessages();
      const result = await invoke<string>("get_sync_config");
      const data = JSON.parse(result) as SyncConfigData & { configured?: boolean };
      if (data.configured) {
        setSyncConfig(data);
        setShowConfig(false);
        await loadSyncStatus();
      } else {
        setSyncConfig(null);
        setShowConfig(true);
        setConfigForm({ ...emptyConfig });
      }
    } catch (e) {
      setError(String(e));
      setShowConfig(true);
    } finally {
      setLoading(false);
    }
  }, [loadSyncStatus]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const handleSaveConfig = async () => {
    clearMessages();
    if (!configForm.server_url || !configForm.team_id || !configForm.auth_token) {
      setError("请填写服务器地址、团队 ID 和认证令牌");
      return;
    }
    setSaving(true);
    try {
      await invoke<string>("save_sync_config", {
        configJson: JSON.stringify(configForm),
      });
      setSuccess("配置已保存");
      setShowConfig(false);
      await loadConfig();
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  };

  const persistSettingChange = async (updated: Partial<SyncConfigData>) => {
    if (!syncConfig) return;
    const merged = { ...syncConfig, ...updated };
    setSyncConfig(merged);
    try {
      await invoke<string>("save_sync_config", {
        configJson: JSON.stringify(merged),
      });
      await loadSyncStatus();
    } catch (e) {
      setError(String(e));
      await loadConfig();
    }
  };

  const handlePull = async () => {
    clearMessages();
    setPulling(true);
    try {
      const result = await invoke<string>("sync_pull");
      const data = JSON.parse(result) as SyncStatus;
      setStatus(data);
      setSuccess("配置拉取成功");
    } catch (e) {
      setError(String(e));
    } finally {
      setPulling(false);
    }
  };

  const handlePush = async () => {
    clearMessages();
    setPushing(true);
    try {
      const result = await invoke<string>("sync_push");
      const data = JSON.parse(result) as SyncStatus;
      setStatus(data);
      setSuccess("配置推送成功");
    } catch (e) {
      setError(String(e));
    } finally {
      setPushing(false);
    }
  };

  const handleToggleAutoPull = () => {
    persistSettingChange({ auto_pull: !syncConfig?.auto_pull });
  };

  const handleConflictModeChange = (mode: string) => {
    persistSettingChange({ conflict_mode: mode });
  };

  const currentStatus = status
    ? statusMap[status.status] || { label: status.status, color: "bg-gray-400" }
    : null;

  const currentConflict = conflictModes.find(
    (m) => m.value === (syncConfig?.conflict_mode ?? status?.conflict_mode)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-gray-500 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  if (showConfig || !syncConfig) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">同步配置</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                服务器地址
              </label>
              <input
                type="text"
                value={configForm.server_url}
                onChange={(e) =>
                  setConfigForm({ ...configForm, server_url: e.target.value })
                }
                placeholder="https://sync.example.com"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                团队 ID
              </label>
              <input
                type="text"
                value={configForm.team_id}
                onChange={(e) =>
                  setConfigForm({ ...configForm, team_id: e.target.value })
                }
                placeholder="team-001"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                团队名称
              </label>
              <input
                type="text"
                value={configForm.team_name}
                onChange={(e) =>
                  setConfigForm({ ...configForm, team_name: e.target.value })
                }
                placeholder="开发团队"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                认证令牌
              </label>
              <input
                type="password"
                value={configForm.auth_token}
                onChange={(e) =>
                  setConfigForm({ ...configForm, auth_token: e.target.value })
                }
                placeholder="your-api-token"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                冲突解决方式
              </label>
              <select
                value={configForm.conflict_mode}
                onChange={(e) =>
                  setConfigForm({ ...configForm, conflict_mode: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {conflictModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label} - {mode.desc}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">自动拉取</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">启动时自动从服务器拉取最新配置</div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setConfigForm({ ...configForm, auto_pull: !configForm.auto_pull })
                }
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  configForm.auto_pull ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    configForm.auto_pull ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                拉取间隔
              </label>
              <input
                type="text"
                value={configForm.pull_interval}
                onChange={(e) =>
                  setConfigForm({ ...configForm, pull_interval: e.target.value })
                }
                placeholder="5m"
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-400">
              {success}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "保存中..." : "保存配置"}
            </button>
            {syncConfig && (
              <button
                onClick={() => {
                  setShowConfig(false);
                  clearMessages();
                }}
                className="px-6 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">团队配置同步</h3>
          {currentStatus && (
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${currentStatus.color}`} />
              <span className="text-sm text-gray-600 dark:text-gray-400">{currentStatus.label}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">团队名称</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {status?.team_name || syncConfig.team_name || "-"}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">团队 ID</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {status?.team_id || syncConfig.team_id}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">服务器地址</div>
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {status?.server_url || syncConfig.server_url}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          上次同步: {status?.last_sync || "从未同步"}
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={handlePull}
            disabled={pulling || pushing}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {pulling ? "拉取中..." : "拉取配置"}
          </button>
          <button
            onClick={handlePush}
            disabled={pulling || pushing}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {pushing ? "推送中..." : "推送配置"}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm text-green-700 dark:text-green-400">
            {success}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">同步设置</h3>

        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">冲突解决方式</div>
          <div className="flex flex-col gap-3">
            {conflictModes.map((mode) => (
              <label key={mode.value} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="conflict_mode"
                  value={mode.value}
                  checked={(syncConfig.conflict_mode === mode.value)}
                  onChange={() => handleConflictModeChange(mode.value)}
                  className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                />
                <div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">{mode.label}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">{mode.desc}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-2">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">自动拉取</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">启动时自动从服务器拉取最新配置</div>
          </div>
          <button
            type="button"
            onClick={handleToggleAutoPull}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              syncConfig.auto_pull ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                syncConfig.auto_pull ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {currentConflict && (
          <div className="mt-4 text-xs text-gray-400 dark:text-gray-500">
            当前策略: {currentConflict.label} — {currentConflict.desc}
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => {
            setConfigForm({ ...syncConfig });
            setShowConfig(true);
            clearMessages();
          }}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          修改配置
        </button>
      </div>
    </div>
  );
}
