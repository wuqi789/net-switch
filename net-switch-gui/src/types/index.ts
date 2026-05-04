export interface Profile {
  name: string;
  description: string;
  http_proxy: string;
  https_proxy: string;
  no_proxy: string;
  has_dns: boolean;
  hosts_count: number;
}

export interface ProfileDetail {
  name: string;
  description: string;
  http_proxy: string;
  https_proxy: string;
  no_proxy: string;
  dns: { servers: string[] } | null;
  hosts: { ip: string; hostname: string }[];
}

export interface CurrentInfo {
  current_profile: string;
  description: string;
  http_proxy: string;
  https_proxy: string;
  no_proxy: string;
  dns: { servers: string[] } | null;
  hosts: { ip: string; hostname: string }[];
}

export interface SystemStatus {
  current_profile: string;
  platform: string;
  proxy: {
    http_proxy: string;
    https_proxy: string;
    no_proxy: string;
  };
  dns: {
    servers: string[];
  };
  hosts: Record<string, { ip: string; hostname: string }[]>;
  backup: {
    count: number;
    latest: string;
  };
}

export interface LogEntry {
  id: number;
  time: string;
  level: "info" | "warn" | "error";
  action: string;
  detail: string;
}

export interface ConfigData {
  profiles: ProfileDetail[];
}

export interface LicenseInfo {
  key: string;
  type: string;
  expires_at: string;
  features: string[];
  device_id: string;
  valid: boolean;
}

export interface RuleInfo {
  name: string;
  trigger_type: string;
  value: string;
  operator: string;
  priority: number;
  enabled: boolean;
  action_type: string;
  profile_name: string;
}

export interface PluginInfo {
  name: string;
  version: string;
  author: string;
  description: string;
  enabled: boolean;
  permissions: string[];
  commands: string[];
}

export interface SyncStatus {
  team_id: string;
  team_name: string;
  server_url: string;
  last_sync: string;
  conflict_mode: string;
  auto_pull: boolean;
  status: string;
}

export interface SyncConfigData {
  team_id: string;
  team_name: string;
  server_url: string;
  auth_token: string;
  conflict_mode: string;
  auto_pull: boolean;
  pull_interval: string;
}
