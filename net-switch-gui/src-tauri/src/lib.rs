use std::path::PathBuf;
use std::process::Command;

fn net_switch_dir() -> Option<PathBuf> {
    let exe_name = if cfg!(target_os = "windows") { "net-switch.exe" } else { "net-switch" };

    let base = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|pp| pp.to_path_buf()))
        .unwrap_or_else(|| std::env::current_dir().unwrap_or_default());

    let offsets = ["../../../net-switch", "../../../../net-switch", "../../net-switch", "../net-switch"];

    for offset in &offsets {
        let dir = base.join(offset);
        if dir.join(exe_name).exists() {
            return dir.canonicalize().ok().or(Some(dir));
        }
    }
    None
}

fn find_net_switch_binary() -> String {
    let exe_name = if cfg!(target_os = "windows") { "net-switch.exe" } else { "net-switch" };
    if let Some(dir) = net_switch_dir() {
        let path = dir.join(exe_name);
        return path.to_string_lossy().to_string();
    }
    "net-switch".to_string()
}

fn find_config_arg() -> Option<String> {
    if let Some(dir) = net_switch_dir() {
        let config = dir.join("config.yaml");
        if config.exists() {
            return Some(config.to_string_lossy().to_string());
        }
    }

    let home = std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .ok()?;

    let home_config = format!("{}/.net-switch/config.yaml", home);
    if std::path::Path::new(&home_config).exists() {
        return Some(home_config);
    }

    None
}

fn net_switch_state_dir() -> PathBuf {
    let home = std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .unwrap_or_default();
    PathBuf::from(&home).join(".net-switch")
}

fn ensure_default_config() {
    let config_dir = net_switch_state_dir();
    let config_path = config_dir.join("config.yaml");
    if config_path.exists() {
        return;
    }
    let _ = std::fs::create_dir_all(&config_dir);
    let default_config = "profiles: []\n";
    let _ = std::fs::write(&config_path, default_config);
}

fn run_net_switch(args: &[&str]) -> Result<String, String> {
    let binary = find_net_switch_binary();
    let mut cmd = Command::new(&binary);

    if let Some(config_path) = find_config_arg() {
        cmd.args(["--config", &config_path]);
    }

    let output = cmd
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute {}: {}", binary, e))?;

    if output.status.success() {
        String::from_utf8(output.stdout)
            .map_err(|e| format!("Invalid UTF-8 output: {}", e))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("net-switch error: {}", stderr))
    }
}

#[cfg(target_os = "windows")]
fn ensure_localhost_proxy_bypass() {
    let base_key = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings";

    let current = Command::new("reg")
        .args(["query", base_key, "/v", "ProxyOverride"])
        .output()
        .ok()
        .and_then(|o| {
            if o.status.success() {
                String::from_utf8(o.stdout).ok()
            } else {
                None
            }
        });

    let mut override_val = if let Some(ref output) = current {
        let mut val = String::new();
        for line in output.lines() {
            if line.contains("ProxyOverride") {
                if let Some(pos) = line.rfind("REG_") {
                    let rest = &line[pos..];
                    if let Some(data_pos) = rest.find("  ") {
                        val = rest[data_pos + 2..].trim().to_string();
                    }
                }
            }
        }
        val
    } else {
        String::new()
    };

    let needs_localhost = !override_val.to_lowercase().contains("localhost");
    let needs_127 = !override_val.to_lowercase().contains("127.0.0.1");

    if needs_localhost || needs_127 {
        if !override_val.is_empty() && !override_val.ends_with(';') {
            override_val.push(';');
        }
        if needs_localhost {
            override_val.push_str("localhost;");
        }
        if needs_127 {
            override_val.push_str("127.0.0.1;");
        }
        override_val.push_str("<local>");

        let _ = Command::new("reg")
            .args(["add", base_key, "/v", "ProxyOverride", "/t", "REG_SZ", "/d", &override_val, "/f"])
            .output();
    }
}

#[cfg(not(target_os = "windows"))]
fn ensure_localhost_proxy_bypass() {}

fn json_string_field(val: &serde_json::Value, key: &str) -> String {
    val.get(key)
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string()
}

#[tauri::command]
fn get_profiles() -> Result<String, String> {
    run_net_switch(&["list", "--format", "json"])
}

#[tauri::command]
fn get_current() -> Result<String, String> {
    run_net_switch(&["current", "--format", "json"])
}

#[tauri::command]
fn get_status() -> Result<String, String> {
    run_net_switch(&["status", "--format", "json"])
}

#[tauri::command]
fn switch_profile(name: String) -> Result<String, String> {
    run_net_switch(&["use", &name])?;
    ensure_localhost_proxy_bypass();
    Ok(format!("Switched to profile: {}", name))
}

#[tauri::command]
fn dry_run_switch(name: String) -> Result<String, String> {
    run_net_switch(&["use", &name, "--dry-run"])
}

#[tauri::command]
fn read_config() -> Result<String, String> {
    let config_path = find_config_file()?;
    std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Cannot read config: {}", e))
}

#[tauri::command]
fn write_config(content: String) -> Result<(), String> {
    let config_path = find_config_file()?;
    std::fs::write(&config_path, content)
        .map_err(|e| format!("Cannot write config: {}", e))
}

fn find_config_file() -> Result<String, String> {
    if let Some(dir) = net_switch_dir() {
        let config = dir.join("config.yaml");
        if config.exists() {
            return Ok(config.to_string_lossy().to_string());
        }
    }

    let home = std::env::var("USERPROFILE")
        .or_else(|_| std::env::var("HOME"))
        .map_err(|_| "Cannot determine home directory")?;

    let home_config = format!("{}/.net-switch/config.yaml", home);
    if std::path::Path::new(&home_config).exists() {
        return Ok(home_config);
    }

    Err("Config file not found".to_string())
}

// ── Sync commands ──────────────────────────────────────────────────────

#[tauri::command]
fn sync_status() -> Result<String, String> {
    run_net_switch(&["sync", "status", "--format", "json"])
}

#[tauri::command]
fn sync_pull() -> Result<String, String> {
    run_net_switch(&["sync", "pull"])?;
    run_net_switch(&["sync", "status", "--format", "json"])
}

#[tauri::command]
fn sync_push() -> Result<String, String> {
    run_net_switch(&["sync", "push"])?;
    run_net_switch(&["sync", "status", "--format", "json"])
}

#[tauri::command]
fn get_sync_config() -> Result<String, String> {
    let config_path = find_config_file()?;
    let content = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Cannot read config: {}", e))?;

    let config: serde_yaml::Value = serde_yaml::from_str(&content)
        .map_err(|e| format!("Cannot parse config: {}", e))?;

    if let Some(ts) = config.get("team-sync") {
        let result = serde_json::json!({
            "configured": true,
            "team_id": ts.get("team_id").and_then(|v| v.as_str()).unwrap_or(""),
            "team_name": ts.get("team_name").and_then(|v| v.as_str()).unwrap_or(""),
            "server_url": ts.get("server_url").and_then(|v| v.as_str()).unwrap_or(""),
            "auth_token": ts.get("auth").and_then(|a| a.get("token")).and_then(|v| v.as_str()).unwrap_or(""),
            "conflict_mode": ts.get("sync").and_then(|s| s.get("conflict_mode")).and_then(|v| v.as_str()).unwrap_or("merge_profiles"),
            "auto_pull": ts.get("sync").and_then(|s| s.get("auto_pull")).and_then(|v| v.as_bool()).unwrap_or(false),
            "pull_interval": ts.get("sync").and_then(|s| s.get("pull_interval")).and_then(|v| v.as_str()).unwrap_or("5m"),
        });
        serde_json::to_string(&result).map_err(|e| format!("JSON error: {}", e))
    } else {
        Ok(r#"{"configured":false}"#.to_string())
    }
}

#[tauri::command]
fn save_sync_config(config_json: String) -> Result<(), String> {
    let data: serde_json::Value = serde_json::from_str(&config_json)
        .map_err(|e| format!("Invalid JSON: {}", e))?;

    let config_path = find_config_file()?;
    let content = std::fs::read_to_string(&config_path)
        .map_err(|e| format!("Cannot read config: {}", e))?;

    let mut config: serde_yaml::Value = serde_yaml::from_str(&content)
        .map_err(|e| format!("Cannot parse config: {}", e))?;

    let team_sync = serde_yaml::Value::Mapping({
        let mut m = serde_yaml::Mapping::new();
        m.insert(
            serde_yaml::Value::String("team_id".into()),
            serde_yaml::Value::String(json_string_field(&data, "team_id")),
        );
        m.insert(
            serde_yaml::Value::String("team_name".into()),
            serde_yaml::Value::String(json_string_field(&data, "team_name")),
        );
        m.insert(
            serde_yaml::Value::String("server_url".into()),
            serde_yaml::Value::String(json_string_field(&data, "server_url")),
        );
        m.insert(
            serde_yaml::Value::String("auth".into()),
            serde_yaml::Value::Mapping({
                let mut am = serde_yaml::Mapping::new();
                am.insert(
                    serde_yaml::Value::String("mode".into()),
                    serde_yaml::Value::String("token".into()),
                );
                am.insert(
                    serde_yaml::Value::String("token".into()),
                    serde_yaml::Value::String(json_string_field(&data, "auth_token")),
                );
                am
            }),
        );
        m.insert(
            serde_yaml::Value::String("sync".into()),
            serde_yaml::Value::Mapping({
                let mut sm = serde_yaml::Mapping::new();
                sm.insert(
                    serde_yaml::Value::String("auto_pull".into()),
                    serde_yaml::Value::Bool(data.get("auto_pull").and_then(|v| v.as_bool()).unwrap_or(false)),
                );
                sm.insert(
                    serde_yaml::Value::String("pull_interval".into()),
                    serde_yaml::Value::String(json_string_field(&data, "pull_interval")),
                );
                sm.insert(
                    serde_yaml::Value::String("conflict_mode".into()),
                    serde_yaml::Value::String(json_string_field(&data, "conflict_mode")),
                );
                sm
            }),
        );
        m
    });

    if let Some(mapping) = config.as_mapping_mut() {
        mapping.insert(
            serde_yaml::Value::String("team-sync".into()),
            team_sync,
        );
    }

    let yaml = serde_yaml::to_string(&config)
        .map_err(|e| format!("YAML error: {}", e))?;
    std::fs::write(&config_path, yaml)
        .map_err(|e| format!("Cannot write config: {}", e))
}

// ── Rules commands ─────────────────────────────────────────────────────

fn rules_file_path() -> PathBuf {
    net_switch_state_dir().join("rules.yaml")
}

fn yaml_str(val: &serde_yaml::Value, key: &str) -> String {
    val.get(key)
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .to_string()
}

fn yaml_bool(val: &serde_yaml::Value, key: &str) -> bool {
    val.get(key)
        .and_then(|v| v.as_bool())
        .unwrap_or(true)
}

fn yaml_i64(val: &serde_yaml::Value, key: &str) -> i64 {
    val.get(key)
        .and_then(|v| v.as_i64())
        .unwrap_or(0)
}

#[tauri::command]
fn list_rules() -> Result<String, String> {
    let path = rules_file_path();
    if !path.exists() {
        return Ok("[]".to_string());
    }

    let content = std::fs::read_to_string(&path)
        .map_err(|e| format!("Cannot read rules: {}", e))?;

    let rule_set: serde_yaml::Value = serde_yaml::from_str(&content)
        .map_err(|e| format!("Cannot parse rules: {}", e))?;

    let rules = match rule_set.get("rules").and_then(|v| v.as_sequence()) {
        Some(r) => r,
        None => return Ok("[]".to_string()),
    };

    let flat: Vec<serde_json::Value> = rules.iter().map(|r| {
        let trigger = r.get("trigger");
        let action = r.get("action");

        serde_json::json!({
            "name": yaml_str(r, "name"),
            "trigger_type": trigger.map(|t| yaml_str(t, "type")).unwrap_or_default(),
            "value": trigger.map(|t| yaml_str(t, "value")).unwrap_or_default(),
            "operator": trigger.map(|t| yaml_str(t, "operator")).unwrap_or_default(),
            "priority": yaml_i64(r, "priority"),
            "enabled": yaml_bool(r, "enabled"),
            "action_type": action.map(|a| yaml_str(a, "type")).unwrap_or_default(),
            "profile_name": action.map(|a| yaml_str(a, "profile")).unwrap_or_default(),
        })
    }).collect();

    serde_json::to_string(&flat).map_err(|e| format!("JSON error: {}", e))
}

fn build_yaml_rule(rule_data: &serde_json::Value) -> serde_yaml::Value {
    serde_yaml::Value::Mapping({
        let mut m = serde_yaml::Mapping::new();
        m.insert(serde_yaml::Value::String("name".into()),
            serde_yaml::Value::String(json_string_field(rule_data, "name")));
        m.insert(serde_yaml::Value::String("description".into()),
            serde_yaml::Value::String("".into()));
        m.insert(serde_yaml::Value::String("enabled".into()),
            serde_yaml::Value::Bool(rule_data.get("enabled").and_then(|v| v.as_bool()).unwrap_or(true)));
        m.insert(serde_yaml::Value::String("priority".into()),
            serde_yaml::Value::Number(rule_data.get("priority").and_then(|v| v.as_i64()).unwrap_or(0).into()));
        m.insert(serde_yaml::Value::String("trigger".into()), serde_yaml::Value::Mapping({
            let mut tm = serde_yaml::Mapping::new();
            tm.insert(serde_yaml::Value::String("type".into()),
                serde_yaml::Value::String(json_string_field(rule_data, "trigger_type")));
            tm.insert(serde_yaml::Value::String("value".into()),
                serde_yaml::Value::String(json_string_field(rule_data, "value")));
            tm.insert(serde_yaml::Value::String("operator".into()),
                serde_yaml::Value::String(json_string_field(rule_data, "operator")));
            tm
        }));
        m.insert(serde_yaml::Value::String("action".into()), serde_yaml::Value::Mapping({
            let mut am = serde_yaml::Mapping::new();
            am.insert(serde_yaml::Value::String("type".into()),
                serde_yaml::Value::String(json_string_field(rule_data, "action_type")));
            am.insert(serde_yaml::Value::String("profile".into()),
                serde_yaml::Value::String(json_string_field(rule_data, "profile_name")));
            am.insert(serde_yaml::Value::String("notify".into()), serde_yaml::Value::Bool(false));
            am.insert(serde_yaml::Value::String("auto_switch".into()), serde_yaml::Value::Bool(false));
            am
        }));
        m.insert(serde_yaml::Value::String("cooldown".into()),
            serde_yaml::Value::String("".into()));
        m
    })
}

fn load_rule_set() -> serde_yaml::Value {
    let path = rules_file_path();
    if path.exists() {
        if let Ok(content) = std::fs::read_to_string(&path) {
            if let Ok(v) = serde_yaml::from_str::<serde_yaml::Value>(&content) {
                return v;
            }
        }
    }
    let mut m = serde_yaml::Mapping::new();
    m.insert(serde_yaml::Value::String("version".into()), serde_yaml::Value::String("1".into()));
    m.insert(serde_yaml::Value::String("rules".into()), serde_yaml::Value::Sequence(vec![]));
    serde_yaml::Value::Mapping(m)
}

fn save_rule_set(rule_set: &serde_yaml::Value) -> Result<(), String> {
    let path = rules_file_path();
    std::fs::create_dir_all(path.parent().unwrap_or(&path))
        .map_err(|e| format!("Cannot create state dir: {}", e))?;
    let yaml = serde_yaml::to_string(rule_set)
        .map_err(|e| format!("YAML error: {}", e))?;
    std::fs::write(&path, yaml)
        .map_err(|e| format!("Cannot write rules: {}", e))
}

#[tauri::command]
fn save_rule(rule: String, original_name: Option<String>) -> Result<(), String> {
    let rule_data: serde_json::Value = serde_json::from_str(&rule)
        .map_err(|e| format!("Invalid rule JSON: {}", e))?;

    let new_rule = build_yaml_rule(&rule_data);
    let new_name = json_string_field(&rule_data, "name");
    let match_name = original_name.as_deref().unwrap_or(&new_name);

    let mut rule_set = load_rule_set();

    if let Some(rules_seq) = rule_set.get_mut("rules").and_then(|v| v.as_sequence_mut()) {
        if let Some(idx) = rules_seq.iter().position(|r| {
            yaml_str(r, "name") == match_name
        }) {
            rules_seq[idx] = new_rule;
        } else {
            rules_seq.push(new_rule);
        }
    }

    save_rule_set(&rule_set)
}

#[tauri::command]
fn delete_rule(name: String) -> Result<(), String> {
    let mut rule_set = load_rule_set();

    if let Some(rules_seq) = rule_set.get_mut("rules").and_then(|v| v.as_sequence_mut()) {
        rules_seq.retain(|r| yaml_str(r, "name") != name);
    }

    save_rule_set(&rule_set)
}

#[tauri::command]
fn toggle_rule(name: String, enabled: bool) -> Result<(), String> {
    let mut rule_set = load_rule_set();

    if let Some(rules_seq) = rule_set.get_mut("rules").and_then(|v| v.as_sequence_mut()) {
        if let Some(rule) = rules_seq.iter_mut().find(|r| yaml_str(r, "name") == name) {
            if let Some(m) = rule.as_mapping_mut() {
                m.insert(
                    serde_yaml::Value::String("enabled".into()),
                    serde_yaml::Value::Bool(enabled),
                );
            }
        }
    }

    save_rule_set(&rule_set)
}

#[tauri::command]
fn test_rule(input: String, trigger_type: String) -> Result<String, String> {
    run_net_switch(&["rules", "test", &input, "--type", &trigger_type])
}

// ── Plugin commands ────────────────────────────────────────────────────

fn plugin_state_path() -> PathBuf {
    net_switch_state_dir().join("plugin_state.yaml")
}

fn load_plugin_state() -> std::collections::HashMap<String, bool> {
    let path = plugin_state_path();
    if !path.exists() {
        return std::collections::HashMap::new();
    }
    let content = std::fs::read_to_string(&path).unwrap_or_default();
    serde_yaml::from_str(&content).unwrap_or_default()
}

fn save_plugin_state(state: &std::collections::HashMap<String, bool>) -> Result<(), String> {
    let path = plugin_state_path();
    std::fs::create_dir_all(path.parent().unwrap_or(&path))
        .map_err(|e| format!("Cannot create state dir: {}", e))?;
    let yaml = serde_yaml::to_string(state).map_err(|e| format!("YAML error: {}", e))?;
    std::fs::write(&path, yaml).map_err(|e| format!("Cannot write state: {}", e))?;
    Ok(())
}

#[tauri::command]
fn list_plugins() -> Result<String, String> {
    let output = run_net_switch(&["plugin", "list", "--format", "json"])?;
    let trimmed = output.trim();
    if trimmed.is_empty() || trimmed == "No plugins installed." {
        return Ok("[]".to_string());
    }

    let parsed: serde_json::Value = serde_json::from_str(trimmed)
        .map_err(|e| format!("Failed to parse plugins JSON: {}", e))?;

    let state = load_plugin_state();

    if let Some(plugins) = parsed.as_array() {
        let result: Vec<serde_json::Value> = plugins.iter().map(|p| {
            let name = json_string_field(p, "name");
            let commands = p.get("commands")
                .and_then(|c| c.as_array())
                .map(|arr| {
                    arr.iter().map(|cmd| {
                        cmd.get("use").and_then(|v| v.as_str()).unwrap_or("").to_string()
                    }).collect::<Vec<_>>()
                })
                .unwrap_or_default();
            let permissions = p.get("permissions")
                .and_then(|c| c.as_array())
                .map(|arr| {
                    arr.iter().map(|v| v.as_str().unwrap_or("").to_string()).collect::<Vec<_>>()
                })
                .unwrap_or_default();
            let enabled = state.get(&name).copied().unwrap_or(true);

            serde_json::json!({
                "name": name,
                "version": json_string_field(p, "version"),
                "author": json_string_field(p, "author"),
                "description": json_string_field(p, "description"),
                "enabled": enabled,
                "permissions": permissions,
                "commands": commands,
            })
        }).collect();
        serde_json::to_string(&result).map_err(|e| format!("JSON error: {}", e))
    } else {
        Ok("[]".to_string())
    }
}

#[tauri::command]
fn toggle_plugin(name: String, enabled: bool) -> Result<(), String> {
    let mut state = load_plugin_state();
    state.insert(name, enabled);
    save_plugin_state(&state)
}

// ── Security commands ──────────────────────────────────────────────────

#[tauri::command]
fn pick_enc_file() -> Result<Option<String>, String> {
    let script = r#"Add-Type -AssemblyName System.Windows.Forms
$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Filter = "加密文件 (*.enc)|*.enc|所有文件 (*.*)|*.*"
$dialog.Title = "选择加密文件"
if ($dialog.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) { $dialog.FileName }"#;
    let output = std::process::Command::new("powershell")
        .args(["-NoProfile", "-Command", script])
        .output()
        .map_err(|e| format!("Failed to open file dialog: {}", e))?;
    let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
    if path.is_empty() {
        Ok(None)
    } else {
        Ok(Some(path))
    }
}

fn config_dir() -> PathBuf {
    net_switch_state_dir()
}

#[tauri::command]
fn check_encryption_status() -> Result<String, String> {
    let dir = config_dir();
    let config_path = dir.join("config.yaml");
    let enc_path = dir.join("config.yaml.enc");

    let config_exists = config_path.exists();
    let enc_exists = enc_path.exists();

    let config_encrypted = if config_exists {
        if let Ok(data) = std::fs::read(&config_path) {
            let content = String::from_utf8_lossy(&data);
            content.starts_with("ENC1:")
        } else {
            false
        }
    } else {
        false
    };

    let enc_info = if enc_exists {
        if let Ok(meta) = std::fs::metadata(&enc_path) {
            Some(serde_json::json!({
                "size": meta.len(),
                "modified": meta.modified().ok()
                    .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                    .map(|d| d.as_secs())
                    .unwrap_or(0),
            }))
        } else {
            None
        }
    } else {
        None
    };

    let result = serde_json::json!({
        "config_exists": config_exists,
        "enc_exists": enc_exists,
        "config_encrypted": config_encrypted,
        "enc_info": enc_info,
        "config_dir": dir.to_string_lossy(),
        "enc_file_path": enc_path.to_string_lossy(),
    });

    serde_json::to_string(&result).map_err(|e| format!("JSON error: {}", e))
}

#[tauri::command]
fn encrypt_config(password: String) -> Result<String, String> {
    if password.is_empty() {
        return Err("Password cannot be empty".to_string());
    }
    let mut args = vec!["encrypt", "--password", &password];
    let config_arg;
    if let Some(cfg) = find_config_arg() {
        config_arg = cfg;
        args.push("--config");
        args.push(&config_arg);
    }
    run_net_switch(&args)
}

#[tauri::command]
fn decrypt_config(password: String, enc_file_path: Option<String>) -> Result<String, String> {
    if password.is_empty() {
        return Err("Password cannot be empty".to_string());
    }
    if let Some(ref file_path) = enc_file_path {
        if !std::path::Path::new(file_path).exists() {
            return Err(format!("加密文件不存在: {}", file_path));
        }
        let dir = config_dir();
        let target = dir.join("config.yaml.enc");
        if std::path::Path::new(file_path) != target {
            std::fs::copy(file_path, &target)
                .map_err(|e| format!("Failed to copy enc file: {}", e))?;
        }
    }
    let mut args = vec!["decrypt", "--password", &password];
    let config_arg;
    if let Some(cfg) = find_config_arg() {
        config_arg = cfg;
        args.push("--config");
        args.push(&config_arg);
    }
    run_net_switch(&args)
}

// ── App entry ──────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    ensure_default_config();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_profiles,
            get_current,
            get_status,
            switch_profile,
            dry_run_switch,
            read_config,
            write_config,
            sync_status,
            sync_pull,
            sync_push,
            get_sync_config,
            save_sync_config,
            list_rules,
            save_rule,
            delete_rule,
            toggle_rule,
            test_rule,
            list_plugins,
            toggle_plugin,
            check_encryption_status,
            encrypt_config,
            decrypt_config,
            pick_enc_file,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
