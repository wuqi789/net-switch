import type { SystemStatus } from "../types";

interface StatusPanelProps {
  status: SystemStatus | null;
}

export default function StatusPanel({ status }: StatusPanelProps) {
  if (!status) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400">加载中...</p>
      </div>
    );
  }

  const proxy = status.proxy ?? { http_proxy: "", https_proxy: "", no_proxy: "" };
  const dnsServers = status.dns?.servers ?? [];
  const hosts = status.hosts ?? {};
  const backup = status.backup ?? { count: 0, latest: "" };

  const hasProxy = proxy.http_proxy !== "" || proxy.https_proxy !== "";

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">系统状态</h2>
          <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded">
            {status.platform ?? "unknown"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-2 h-2 rounded-full ${hasProxy ? "bg-green-500" : "bg-gray-400"}`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">代理</span>
            </div>
            {hasProxy ? (
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {proxy.http_proxy && (
                  <div>HTTP: {proxy.http_proxy}</div>
                )}
                {proxy.https_proxy && (
                  <div>HTTPS: {proxy.https_proxy}</div>
                )}
                {proxy.no_proxy && (
                  <div>绕过: {proxy.no_proxy}</div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">未设置代理</p>
            )}
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-2 h-2 rounded-full ${dnsServers.length > 0 ? "bg-green-500" : "bg-gray-400"}`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">DNS</span>
            </div>
            {dnsServers.length > 0 ? (
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {dnsServers.map((s, i) => (
                  <div key={i}>{s}</div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">未设置 DNS</p>
            )}
          </div>

          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-2 h-2 rounded-full ${Object.keys(hosts).length > 0 ? "bg-green-500" : "bg-gray-400"}`}
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Hosts</span>
            </div>
            {Object.keys(hosts).length > 0 ? (
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                {Object.entries(hosts).map(([profile, entries]) => (
                  <div key={profile}>
                    {profile}: {entries.length} 条
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 dark:text-gray-500">无管理的 hosts 记录</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">备份信息</h3>
        {backup.count > 0 ? (
          <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div>备份数量: {backup.count}</div>
            {backup.latest && <div>最新备份: {backup.latest}</div>}
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">暂无备份</p>
        )}
      </div>
    </div>
  );
}
