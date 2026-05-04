import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { LicenseInfo } from "../types";

export default function LicenseActivation() {
  const [licenseKey, setLicenseKey] = useState("");
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleActivate = async () => {
    if (!licenseKey.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<string>("activate_license", { key: licenseKey });
      const data = JSON.parse(result) as LicenseInfo;
      setLicenseInfo(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<string>("activate_license", { key: licenseKey });
      const data = JSON.parse(result) as LicenseInfo;
      setLicenseInfo(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">License 激活</h3>

        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={licenseKey}
            onChange={(e) => setLicenseKey(e.target.value)}
            placeholder="请输入 License Key"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleActivate}
            disabled={loading || !licenseKey.trim()}
            className="px-6 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "激活中..." : "激活"}
          </button>
          <button
            onClick={handleCheckStatus}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            检查状态
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            {error}
          </div>
        )}
      </div>

      {licenseInfo && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">License 信息</h3>
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                licenseInfo.valid
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {licenseInfo.valid ? "有效" : "已过期/无效"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">类型</div>
              <div className="text-sm font-medium text-gray-900">{licenseInfo.type}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">到期时间</div>
              <div className="text-sm font-medium text-gray-900">{licenseInfo.expires_at}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">设备 ID</div>
              <div className="text-sm font-medium text-gray-900">{licenseInfo.device_id}</div>
            </div>
            <div className="p-4 rounded-lg bg-gray-50">
              <div className="text-xs text-gray-500 mb-1">Key</div>
              <div className="text-sm font-medium text-gray-900 truncate">{licenseInfo.key}</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-xs text-gray-500 mb-2">功能列表</div>
            <div className="flex flex-wrap gap-2">
              {licenseInfo.features.map((feature) => (
                <span
                  key={feature}
                  className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}