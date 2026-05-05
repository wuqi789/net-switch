import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useTheme } from "../contexts/ThemeContext";

interface ConfigEditorProps {
  onSave: () => void;
}

export default function ConfigEditor({ onSave }: ConfigEditorProps) {
  const [config, setConfig] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const content = await invoke<string>("read_config");
      setConfig(content);
    } catch (e) {
      setError(String(e));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await invoke("write_config", { content: config });
      setSaved(true);
      onSave();
      const fresh = await invoke<string>("read_config");
      setConfig(fresh);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const themeOptions = [
    { value: "light" as const, label: "浅色", icon: "☀️" },
    { value: "dark" as const, label: "深色", icon: "🌙" },
    { value: "system" as const, label: "跟随系统", icon: "💻" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">应用设置</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">配置应用外观和偏好</p>
        </div>
        <div className="p-4">
          <div className="mb-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">主题外观</div>
            <div className="flex gap-3">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                    theme === opt.value
                      ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  <span>{opt.icon}</span>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            配置文件编辑器
          </h2>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="text-sm text-green-600 dark:text-green-400">✓ 已保存</span>
            )}
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-4 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "保存中..." : "保存"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="p-4">
          <textarea
            value={config}
            onChange={(e) => {
              setConfig(e.target.value);
              setSaved(false);
            }}
            className="w-full h-96 font-mono text-sm p-4 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
            spellCheck={false}
            placeholder="YAML 配置内容..."
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            直接编辑 config.yaml 配置文件。保存后点击"刷新"按钮更新 Profile 列表。
          </p>
        </div>
      </div>
    </div>
  );
}
