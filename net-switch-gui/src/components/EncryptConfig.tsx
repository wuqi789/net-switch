import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

interface EncryptionStatus {
  config_exists: boolean;
  enc_exists: boolean;
  config_encrypted: boolean;
  enc_info: { size: number; modified: number } | null;
  config_dir: string;
  enc_file_path: string;
}

export default function EncryptConfig() {
  const [encStatus, setEncStatus] = useState<EncryptionStatus | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [decryptPassword, setDecryptPassword] = useState("");
  const [selectedEncFile, setSelectedEncFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDecryptPassword, setShowDecryptPassword] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const raw = await invoke<string>("check_encryption_status");
      setEncStatus(JSON.parse(raw));
    } catch (e) {
      setError(String(e));
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  const getPasswordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabel = passwordStrength <= 2 ? "弱" : passwordStrength <= 4 ? "中" : "强";
  const strengthColor = passwordStrength <= 2 ? "bg-red-500" : passwordStrength <= 4 ? "bg-yellow-500" : "bg-green-500";
  const strengthTextColor = passwordStrength <= 2 ? "text-red-600 dark:text-red-400" : passwordStrength <= 4 ? "text-yellow-600 dark:text-yellow-400" : "text-green-600 dark:text-green-400";

  const isEncrypted = encStatus?.config_encrypted || false;
  const hasEncFile = encStatus?.enc_exists || false;

  const handleEncrypt = async () => {
    if (!password.trim()) return;
    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }
    if (passwordStrength <= 2) {
      setError("密码强度太弱，请使用更复杂的密码");
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await invoke("encrypt_config", { password });
      setPassword("");
      setConfirmPassword("");
      await loadStatus();
      setSuccess(`配置文件加密成功！输出文件：${encStatus?.enc_file_path || "~/.net-switch/config.yaml.enc"}`);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await invoke<string | null>("pick_enc_file");
      if (result) {
        setSelectedEncFile(result);
        setError(null);
      }
    } catch (e) {
      setError(String(e));
    }
  };

  const handleDecrypt = async () => {
    if (!decryptPassword.trim()) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await invoke("decrypt_config", {
        password: decryptPassword,
        encFilePath: selectedEncFile || null,
      });
      setSuccess("配置文件解密成功！");
      setDecryptPassword("");
      setSelectedEncFile(null);
      await loadStatus();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "未知";
    return new Date(timestamp * 1000).toLocaleString("zh-CN");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">配置文件加密</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            使用 AES-256-GCM 算法加密配置文件，保护敏感的代理密码和认证信息
          </p>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 mb-5">
            <div
              className={`w-3 h-3 rounded-full ${
                isEncrypted ? "bg-green-500" : hasEncFile ? "bg-yellow-500" : "bg-gray-400"
              }`}
            />
            <div>
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {isEncrypted ? "已加密（当前生效）" : hasEncFile ? "存在加密备份（未启用）" : "未加密"}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {isEncrypted
                  ? "配置文件已加密保护"
                  : hasEncFile
                  ? "检测到 config.yaml.enc 文件，但当前使用的是明文配置"
                  : "配置文件为明文存储，建议加密保护"}
              </p>
            </div>
          </div>

          {hasEncFile && encStatus?.enc_info && (
            <div className="mb-5 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400">
                <span className="font-medium">加密文件：</span>
                <span className="font-mono text-xs break-all">{encStatus.enc_file_path}</span>
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400/70 mt-1">
                {formatFileSize(encStatus.enc_info.size)}，最后修改于 {formatDate(encStatus.enc_info.modified)}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-between">
              <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
              <button onClick={() => setError(null)} className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm">
                ✕
              </button>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <span className="text-sm text-green-700 dark:text-green-400 whitespace-pre-wrap break-all">{success}</span>
              <button onClick={() => setSuccess(null)} className="float-right text-green-500 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm">
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">🔐</span>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">加密配置</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    加密密码
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="输入加密密码"
                      className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${strengthColor}`}
                          style={{ width: `${(passwordStrength / 6) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium ${strengthTextColor}`}>
                        {strengthLabel}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    确认密码
                  </label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">密码不一致</p>
                  )}
                </div>

                <button
                  onClick={handleEncrypt}
                  disabled={loading || !password.trim() || password !== confirmPassword || passwordStrength <= 2}
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {loading ? "加密中..." : "加密配置文件"}
                </button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-base">🔓</span>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">解密配置</h4>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    选择加密文件
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePickFile}
                      className="px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors whitespace-nowrap"
                    >
                      浏览文件...
                    </button>
                    <div className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 truncate min-w-0">
                      {selectedEncFile ? (
                        <span className="text-gray-900 dark:text-gray-100 font-mono text-xs">{selectedEncFile}</span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">未选择文件（将使用默认加密文件）</span>
                      )}
                    </div>
                  </div>
                  {selectedEncFile && (
                    <button
                      onClick={() => setSelectedEncFile(null)}
                      className="mt-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      清除选择，使用默认加密文件
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    解密密码
                  </label>
                  <div className="relative">
                    <input
                      type={showDecryptPassword ? "text" : "password"}
                      value={decryptPassword}
                      onChange={(e) => setDecryptPassword(e.target.value)}
                      placeholder="输入解密密码"
                      className="w-full px-3 py-2 pr-10 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDecryptPassword(!showDecryptPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showDecryptPassword ? "🙈" : "👁"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDecrypt}
                  disabled={loading || !decryptPassword.trim()}
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium bg-gray-600 dark:bg-gray-500 text-white hover:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? "解密中..." : "解密配置文件"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">安全提示</h3>
        </div>
        <div className="p-5">
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 dark:text-blue-400 mt-0.5">●</span>
              <span>使用 AES-256-GCM 加密算法，提供认证加密保护</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 dark:text-blue-400 mt-0.5">●</span>
              <span>PBKDF2 密钥派生（600,000 次迭代），防止暴力破解</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-blue-500 dark:text-blue-400 mt-0.5">●</span>
              <span>每个加密文件使用独立的随机盐值和初始化向量</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 dark:text-yellow-400 mt-0.5">⚠</span>
              <span>请妥善保管加密密码，密码丢失将无法恢复配置</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-500 dark:text-yellow-400 mt-0.5">⚠</span>
              <span>加密后建议删除原始明文配置文件（config.yaml）</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
