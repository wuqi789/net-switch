import { useState } from "react";
import type { LogEntry } from "../types";

interface LogViewerProps {
  logs: LogEntry[];
}

const levelColors = {
  info: "bg-blue-100 text-blue-700",
  warn: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
};

export default function LogViewer({ logs }: LogViewerProps) {
  const [filter, setFilter] = useState<"all" | LogEntry["level"]>("all");

  const filtered = filter === "all" ? logs : logs.filter((l) => l.level === filter);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">操作日志</h2>
        <div className="flex gap-1">
          {(["all", "info", "warn", "error"] as const).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === level
                  ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
              }`}
            >
              {level === "all" ? "全部" : level.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-96 overflow-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            暂无日志记录
          </div>
        ) : (
          filtered.map((log) => (
            <div key={log.id} className="flex items-start gap-3 px-4 py-3">
              <span className="text-xs text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap pt-0.5">
                {log.time}
              </span>
              <span
                className={`text-xs px-1.5 py-0.5 rounded font-medium ${levelColors[log.level]}`}
              >
                {log.level.toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {log.action}
                </div>
                {log.detail && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {log.detail}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
