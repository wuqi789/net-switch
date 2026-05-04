import { useState } from "react";
import type { Profile } from "../types";
import StatusIndicator from "./StatusIndicator";

interface ProfileCardProps {
  profile: Profile;
  isActive: boolean;
  loading: boolean;
  onSwitch: (name: string) => void;
  onDryRun: (name: string) => Promise<string>;
}

export default function ProfileCard({
  profile,
  isActive,
  loading,
  onSwitch,
  onDryRun,
}: ProfileCardProps) {
  const [dryRunResult, setDryRunResult] = useState<string | null>(null);
  const [showDryRun, setShowDryRun] = useState(false);

  const handleDryRun = async () => {
    setShowDryRun(true);
    setDryRunResult(null);
    const result = await onDryRun(profile.name);
    setDryRunResult(result);
  };

  return (
    <div
      className={`rounded-lg border p-4 transition-all ${
        isActive
          ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md"
          : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusIndicator active={isActive} />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{profile.name}</h3>
        </div>
        {isActive && (
          <span className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full">
            当前
          </span>
        )}
      </div>

      {profile.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{profile.description}</p>
      )}

      <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 mb-3">
        {profile.http_proxy && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400 dark:text-gray-500">HTTP:</span>
            <span className="truncate">{profile.http_proxy}</span>
          </div>
        )}
        {profile.https_proxy && (
          <div className="flex items-center gap-1">
            <span className="text-gray-400 dark:text-gray-500">HTTPS:</span>
            <span className="truncate">{profile.https_proxy}</span>
          </div>
        )}
        {!profile.http_proxy && !profile.https_proxy && (
          <span className="text-gray-400 dark:text-gray-500">无代理</span>
        )}
        <div className="flex gap-3">
          {profile.has_dns && (
            <span className="text-green-600">✓ DNS</span>
          )}
          {profile.hosts_count > 0 && (
            <span className="text-green-600">
              ✓ Hosts ({profile.hosts_count})
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSwitch(profile.name)}
          disabled={isActive || loading}
          className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
            isActive
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
          }`}
        >
          {loading ? "切换中..." : isActive ? "已激活" : "切换"}
        </button>
        <button
          onClick={handleDryRun}
          className="px-3 py-1.5 rounded text-sm text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          预览
        </button>
      </div>

      {showDryRun && (
        <div className="mt-3 p-3 bg-gray-900 dark:bg-gray-950 rounded text-xs text-green-400 font-mono overflow-auto max-h-48">
          {dryRunResult || "加载中..."}
          <button
            onClick={() => setShowDryRun(false)}
            className="block mt-2 text-gray-500 dark:text-gray-400 hover:text-gray-300 dark:hover:text-gray-200"
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
