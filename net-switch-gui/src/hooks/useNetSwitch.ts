import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { Profile, CurrentInfo, SystemStatus, LogEntry } from "../types";

export function useNetSwitch() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [current, setCurrent] = useState<CurrentInfo | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  let logId = 0;

  const addLog = useCallback(
    (level: LogEntry["level"], action: string, detail: string) => {
      const entry: LogEntry = {
        id: ++logId,
        time: new Date().toLocaleTimeString(),
        level,
        action,
        detail,
      };
      setLogs((prev) => [entry, ...prev].slice(0, 200));
    },
    [],
  );

  const fetchProfiles = useCallback(async () => {
    try {
      const result = await invoke<string>("get_profiles");
      const data = JSON.parse(result);
      const list = Array.isArray(data) ? data : [];
      setProfiles(list);
      addLog("info", "加载 Profile", `成功加载 ${list.length} 个 Profile`);
    } catch (e) {
      const msg = String(e);
      setProfiles([]);
      if (msg.includes("no profiles") || msg.includes("not found")) {
        // normal: no profiles yet
      } else {
        setError(msg);
        addLog("error", "加载 Profile 失败", msg);
      }
    }
  }, [addLog]);

  const fetchCurrent = useCallback(async () => {
    try {
      const result = await invoke<string>("get_current");
      const data = JSON.parse(result);
      setCurrent(data && typeof data === "object" ? data : null);
    } catch (e) {
      const msg = String(e);
      setCurrent(null);
      if (!msg.includes("not set")) {
        setError(msg);
      }
    }
  }, []);

  const fetchStatus = useCallback(async () => {
    try {
      const result = await invoke<string>("get_status");
      const data = JSON.parse(result);
      setStatus(data && typeof data === "object" ? data : null);
    } catch (e) {
      const msg = String(e);
      setStatus(null);
      if (!msg.includes("no profiles") && !msg.includes("not found")) {
        setError(msg);
      }
    }
  }, []);

  const switchProfile = useCallback(
    async (name: string) => {
      setLoading(true);
      setError(null);
      try {
        await invoke("switch_profile", { name });
        addLog("info", "切换成功", `已切换到 ${name}，系统代理/DNS/hosts 已更新`);
        await fetchCurrent();
        await fetchStatus();
      } catch (e) {
        const msg = String(e);
        setError(msg);
        addLog("error", "切换失败", msg);
      } finally {
        setLoading(false);
      }
    },
    [addLog, fetchCurrent, fetchStatus],
  );

  const dryRunSwitch = useCallback(
    async (name: string): Promise<string> => {
      try {
        const result = await invoke<string>("dry_run_switch", { name });
        addLog("info", "预览", `${name} 的 dry-run 结果`);
        return result;
      } catch (e) {
        return String(e);
      }
    },
    [addLog],
  );

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchProfiles(), fetchCurrent(), fetchStatus()]);
    setLoading(false);
  }, [fetchProfiles, fetchCurrent, fetchStatus]);

  const initWithDefault = useCallback(async () => {
    setLoading(true);
    try {
      await fetchProfiles();
      const result = await invoke<string>("get_current");
      const data = JSON.parse(result);
      setCurrent(data && typeof data === "object" ? data : null);

      const profileName = data?.current_profile;
      if (profileName) {
        try {
          await invoke("switch_profile", { name: profileName });
          addLog("info", "自动激活", `已自动激活默认 Profile: ${profileName}`);
        } catch {
          // switch may fail if profile doesn't exist, not critical
        }
      }

      await fetchStatus();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }, [fetchProfiles, fetchStatus, addLog]);

  return {
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
    clearError: () => setError(null),
  };
}
