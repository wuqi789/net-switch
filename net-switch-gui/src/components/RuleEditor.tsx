import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { RuleInfo, Profile } from "../types";

const triggerTypes = [
  { value: "domain", label: "域名", placeholder: "例如: api.github.com", desc: "当访问该域名时触发" },
  { value: "ip", label: "IP 地址", placeholder: "例如: 10.50.0.0/16", desc: "当连接到该 IP 或网段时触发" },
  { value: "ssid", label: "WiFi SSID", placeholder: "例如: CorpNet", desc: "当连接到该 WiFi 时触发" },
  { value: "process", label: "进程名", placeholder: "例如: docker", desc: "当该进程运行时触发" },
] as const;

const operators = [
  { value: "match", label: "精确匹配", desc: "完全一致才触发" },
  { value: "contains", label: "包含", desc: "包含指定文本即触发" },
  { value: "regex", label: "正则表达式", desc: "匹配正则模式" },
  { value: "cidr", label: "CIDR", desc: "IP 在网段内即触发" },
] as const;

const actionTypes = [
  { value: "switch_profile", label: "切换配置", desc: "自动切换到指定网络环境" },
  { value: "notify", label: "通知提醒", desc: "弹出通知提示用户" },
] as const;

const emptyRule: RuleInfo = {
  name: "",
  trigger_type: "domain",
  value: "",
  operator: "match",
  priority: 0,
  enabled: true,
  action_type: "switch_profile",
  profile_name: "",
};

function FieldLabel({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="mb-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
    </div>
  );
}

export default function RuleEditor() {
  const [rules, setRules] = useState<RuleInfo[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [newRule, setNewRule] = useState<RuleInfo>({ ...emptyRule });
  const [editingName, setEditingName] = useState<string | null>(null);
  const [testInput, setTestInput] = useState("");
  const [testTriggerType, setTestTriggerType] = useState("domain");
  const [testResult, setTestResult] = useState<string | null>(null);

  const loadRules = async () => {
    setLoading(true);
    try {
      const result = await invoke<string>("list_rules");
      const data = JSON.parse(result) as RuleInfo[];
      setRules(data);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const loadProfiles = useCallback(async () => {
    try {
      const result = await invoke<string>("get_profiles");
      const data = JSON.parse(result) as Profile[];
      setProfiles(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadRules();
    loadProfiles();
  }, [loadProfiles]);

  const currentTrigger = triggerTypes.find((t) => t.value === newRule.trigger_type) ?? triggerTypes[0];
  const currentOperator = operators.find((o) => o.value === newRule.operator) ?? operators[0];
  const currentAction = actionTypes.find((a) => a.value === newRule.action_type) ?? actionTypes[0];

  const handleSaveRule = async () => {
    if (!newRule.name.trim() || !newRule.value.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = { rule: JSON.stringify(newRule) };
      if (editingName) {
        payload.original_name = editingName;
      }
      await invoke("save_rule", payload);
      setShowForm(false);
      setEditingName(null);
      setNewRule({ ...emptyRule });
      await loadRules();
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleEditRule = (rule: RuleInfo) => {
    setEditingName(rule.name);
    setNewRule({ ...rule });
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingName(null);
    setNewRule({ ...emptyRule });
  };

  const handleToggleRule = async (rule: RuleInfo) => {
    try {
      await invoke("toggle_rule", { name: rule.name, enabled: !rule.enabled });
      await loadRules();
    } catch (e) {
      setError(String(e));
    }
  };

  const handleDeleteRule = async (rule: RuleInfo) => {
    try {
      await invoke("delete_rule", { name: rule.name });
      await loadRules();
    } catch (e) {
      setError(String(e));
    }
  };

  const handleTestRule = async () => {
    if (!testInput.trim()) return;
    try {
      const result = await invoke<string>("test_rule", {
        input: testInput,
        triggerType: testTriggerType,
      });
      setTestResult(result);
    } catch (e) {
      setTestResult(String(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">自动规则</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              当满足条件时自动切换网络环境，优先级数字越大越先匹配
            </p>
          </div>
          <button
            onClick={() => {
              if (showForm) {
                handleCancelForm();
              } else {
                setEditingName(null);
                setNewRule({ ...emptyRule });
                setShowForm(true);
              }
            }}
            className="px-4 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            {showForm ? "收起" : "添加规则"}
          </button>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {showForm && (
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
            {editingName && (
              <div className="mb-4 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-sm text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <span className="font-medium">正在编辑规则：{editingName}</span>
                <span className="text-amber-500">修改后点击「保存修改」</span>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <FieldLabel label="规则名称" desc="给规则起一个易于识别的名字" />
                <input
                  type="text"
                  value={newRule.name}
                  onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="例如: office-wifi、client-vpn"
                />
              </div>
              <div>
                <FieldLabel label="优先级" desc="数字越大越先匹配，范围 0 ~ 9，默认为 0" />
                <input
                  type="number"
                  min={0}
                  max={9}
                  value={newRule.priority}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 0 && v <= 9) setNewRule({ ...newRule, priority: v });
                  }}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium">触发条件</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">—— 什么时候触发这条规则</span>
                </div>
              </div>

              <div>
                <FieldLabel label="触发类型" desc={currentTrigger.desc} />
                <select
                  value={newRule.trigger_type}
                  onChange={(e) => setNewRule({ ...newRule, trigger_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {triggerTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel label="匹配方式" desc={currentOperator.desc} />
                <select
                  value={newRule.operator}
                  onChange={(e) => setNewRule({ ...newRule, operator: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {operators.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <FieldLabel label="匹配值" desc={`要匹配的${currentTrigger.label}，使用 ${currentOperator.label} 方式`} />
                <input
                  type="text"
                  value={newRule.value}
                  onChange={(e) => setNewRule({ ...newRule, value: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={currentTrigger.placeholder}
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">执行动作</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">—— 触发后执行什么操作</span>
                </div>
              </div>

              <div>
                <FieldLabel label="动作类型" desc={currentAction.desc} />
                <select
                  value={newRule.action_type}
                  onChange={(e) => setNewRule({ ...newRule, action_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {actionTypes.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel
                  label="目标配置"
                  desc={newRule.action_type === "switch_profile"
                    ? "触发时自动切换到的网络环境"
                    : "触发时弹出通知（无需选择配置）"
                  }
                />
                {newRule.action_type === "switch_profile" ? (
                  <select
                    value={newRule.profile_name}
                    onChange={(e) => setNewRule({ ...newRule, profile_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">请选择网络环境</option>
                    {profiles.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}{p.description ? ` — ${p.description}` : ""}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={newRule.profile_name}
                    onChange={(e) => setNewRule({ ...newRule, profile_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100 dark:bg-gray-600"
                    placeholder="通知动作无需填写"
                    disabled
                  />
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveRule}
                disabled={loading || !newRule.name.trim() || !newRule.value.trim()}
                className="px-4 py-1.5 rounded text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {editingName ? "保存修改" : "保存规则"}
              </button>
              <button
                onClick={handleCancelForm}
                className="px-4 py-1.5 rounded text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        )}

        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">名称</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">触发类型</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">匹配值</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">目标配置</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">优先级</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">启用</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {rules.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    {loading ? "加载中..." : "暂无规则，点击「添加规则」创建"}
                  </td>
                </tr>
              ) : (
                rules.map((rule) => (
                  <tr key={rule.name} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-gray-900 dark:text-gray-100 font-medium">{rule.name}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {triggerTypes.find((t) => t.value === rule.trigger_type)?.label || rule.trigger_type}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400 font-mono text-xs">{rule.value}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{rule.profile_name || "—"}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{rule.priority}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleRule(rule)}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          rule.enabled ? "bg-blue-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            rule.enabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule)}
                          className="text-red-500 hover:text-red-700 text-sm transition-colors"
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">规则测试</h3>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">输入一个值，测试是否有规则匹配</p>
        <div className="flex gap-3 mb-4">
          <select
            value={testTriggerType}
            onChange={(e) => setTestTriggerType(e.target.value)}
            className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {triggerTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <input
            type="text"
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder={triggerTypes.find((t) => t.value === testTriggerType)?.placeholder ?? "输入测试内容"}
            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleTestRule}
            disabled={!testInput.trim()}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            测试规则
          </button>
        </div>
        {testResult !== null && (
          <div className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 font-mono">
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
}
