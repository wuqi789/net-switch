<p align="center">
  <br/>
  <img src="docs/images/logo.png" alt="net-switch" width="180" />
  <br/><br/>
</p>

<h1 align="center">net-switch</h1>

<p align="center">
  <strong>The developer's network environment switcher 鈥?CLI + GUI, plugin-powered, team-ready.</strong>
</p>

<p align="center">
  <a href="https://golang.org"><img src="https://img.shields.io/badge/Go-1.26+-00ADD8?style=flat-square&logo=go&logoColor=white" alt="Go Version" /></a>
  <a href="https://github.com/wuqi789/net-switch/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License: MIT" /></a>
  <a href="https://github.com/wuqi789/net-switch/releases"><img src="https://img.shields.io/github/v/release/wuqi789/net-switch?style=flat-square&logo=github" alt="Release" /></a>
  <a href="https://github.com/wuqi789/net-switch/stargazers"><img src="https://img.shields.io/github/stars/wuqi789/net-switch?style=flat-square&logo=github" alt="Stars" /></a>
  <a href="https://goreportcard.com/report/github.com/wuqi789/net-switch"><img src="https://goreportcard.com/badge/github.com/wuqi789/net-switch?style=flat-square" alt="Go Report Card" /></a>
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> &bull;
  <a href="#-installation">Installation</a> &bull;
  <a href="#gui-desktop-app-recommended">GUI</a> &bull;
  <a href="#-cli-usage">CLI Usage</a> &bull;
  <a href="#-configuration">Configuration</a> &bull;
  <a href="#-plugin-system">Plugins</a> &bull;
  <a href="#-architecture">Architecture</a> &bull;
  <a href="#-contributing">Contributing</a>
</p>

---

## Why net-switch?

Every developer juggles multiple network environments daily 鈥?corporate proxies at the office, direct connections at home, VPN tunnels for client access, cloud-specific DNS for remote clusters. Each switch means manually updating `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`, DNS servers, and `/etc/hosts` entries. Miss one setting and you'll spend 30 minutes debugging a connection that "just worked yesterday." Multiply this by every tool on your machine that respects proxy environment variables (Docker, npm, pip, kubectl, git) and the toil adds up fast.

Current workarounds range from shell aliases and dotfile scripts to platform-specific GUIs that only handle one piece of the puzzle. None of them give you a **single source of truth** for your entire network footprint 鈥?proxy, DNS, hosts, and tool-specific configs 鈥?let alone the ability to share those configs with your team, encrypt secrets at rest, or trigger switches automatically based on the Wi-Fi network you just joined.

**net-switch** changes that. Define your environments once in a YAML file. Switch between them with a single command. Let rules detect your context and switch automatically. Share profiles with your team through encrypted sync. And when you need a visual overview, launch the desktop GUI 鈥?all from the same project, the same config, the same workflow.

---

## Features

| Feature | Description |
|:--------|:------------|
| 鈿?**One-Command Switch** | Set proxy, DNS, hosts, and env vars in a single `net-switch use <profile>` |
| 馃攲 **Plugin System** | Interface-based architecture with EventBus, lifecycle hooks, and manifest-driven loading |
| 馃敀 **Config Encryption** | AES-256-GCM field-level encryption with PBKDF2 key derivation 鈥?secrets stay safe at rest |
| 馃攧 **Auto-Switch Rules** | Trigger profile changes on domain, IP, SSID, or process detection |
| 鈽革笍 **Kubernetes Integration** | List, switch, and namespace-manage kubectl contexts from the CLI |
| 馃懃 **Team Sync** | Pull/push profiles via REST API with conflict resolution and merge strategies |
| 馃枼锔?**GUI Desktop App** | Tauri v2 + React 18 + TypeScript + Tailwind CSS native desktop application |
| 馃寪 **Cross-Platform** | Windows, macOS, and Linux 鈥?ARM64 and AMD64 |
| 馃И **Dry-Run Mode** | Preview every change before it happens with `--dry-run` |
| 馃摐 **JSON Output** | Machine-readable `--format json` on every command for scripting and CI |
| 馃攽 **OAuth2 + PKCE** | Secure team authentication without sharing passwords |


---

## Quick Start

**1 鈥?Install the GUI Desktop App (Recommended)**

Download the one-click installer for your platform from the [Releases](https://github.com/wuqi789/net-switch-gui/releases) page:

| Platform | File | Description |
|:---------|:-----|:------------|
| Windows  | `NetSwitch_X.Y.Z_x64-setup.exe` | Windows NSIS installer (requires administrator privileges) |
| macOS (Apple Silicon) | `NetSwitch_X.Y.Z_aarch64.dmg` | For M1/M2/M3/M4 Macs |
| macOS (Intel) | `NetSwitch_X.Y.Z_x64.dmg` | For Intel-based Macs |

After installation, the app will automatically request the necessary permissions on each launch.

**2 鈥?Install the CLI (Optional)**

If you prefer the command line:

```bash
go install github.com/wuqi789/net-switch/cmd/net-switch@latest
```

**3 鈥?Switch (Administrator privileges)**

```bash
net-switch use office
```

That's it. Proxy, DNS, and hosts are now configured for your corporate network.

---

## Installation

### Download Pre-built Binaries (Recommended)

Download the latest release for your platform from the [Releases](https://github.com/wuqi789/net-switch/releases) page:

| Platform | Architecture | File |
|:---|:-------------|:-----|
| Windows | amd64 | `windows-x86_64.zip` |
| macOS (Apple Silicon) | arm64 | `macos-aarch64-apple-darwin.zip` |
| macOS (Intel) | amd64 | `macos-x86_64-apple-darwin.zip` |

After downloading, extract the archive and add the binary to your PATH.

### Build from Source

**Prerequisites:**
- [Go](https://golang.org/) 1.26 or later
- [Make](https://www.gnu.org/software/make/) (optional, for using Makefile)

**Steps:**

```bash
# Clone the repository
git clone https://github.com/wuqi789/net-switch.git
cd net-switch

# Build using Make (recommended)
make build

# Or build directly with Go
go build -o bin/netenv ./cmd/netenv/

# For cross-platform builds
make build-all
# Or use the build script
./scripts/build.sh
```

The compiled binary will be in the `bin/` directory.

---

## GUI Desktop App (Recommended)

A cross-platform desktop application built with **Tauri v2 + React 18 + TypeScript + Tailwind CSS**.

Features include:
- Visual profile management with status indicators
- Real-time network status monitoring dashboard
- Team sync panel for pulling and pushing profiles
- Encrypted config editing with a built-in YAML editor
- Auto-switch rule configuration with visual triggers
- Plugin management with lifecycle visualization
- Dark and light theme support

### Running the GUI

The GUI source lives in a separate repository `net-switch-gui`:

```
github.com/wuqi789/
鈹溾攢鈹€ net-switch/          # CLI project (this repo)
鈹斺攢鈹€ net-switch-gui/      # GUI project (separate repo)
```

**Prerequisites:**

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/) (required by Tauri)
- A compiled `net-switch` CLI binary

**Steps:**

```bash
# 1. Clone the GUI repo
git clone https://github.com/wuqi789/net-switch-gui.git
cd net-switch-gui

# 2. Install GUI dependencies
npm install

# 3. Start the GUI (dev mode)
npm run tauri dev
```

The first launch compiles the Rust backend and may take a few minutes. Subsequent launches use incremental compilation and are much faster.

To preview the frontend UI only (without native features):

```bash
npm run dev
```

Then open `http://localhost:5173` in your browser.

---

## CLI Usage

### List Profiles

```bash
$ net-switch list
鍙敤鐨勭綉缁滅幆澧?
鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
鈻?company  -  鍏徃鍐呯綉鐜
  vpn      -  VPN 鐜
  test     -  娴嬭瘯鐜
  direct   -  鐩磋繛锛堟棤浠ｇ悊锛?鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
浣跨敤 'net-switch use <profile>' 鍒囨崲鐜
```

JSON output for scripting:

```bash
$ net-switch list --format json
[
  {
    "name": "company",
    "description": "鍏徃鍐呯綉鐜",
    "http_proxy": "http://proxy.company.com:8080",
    "https_proxy": "http://proxy.company.com:8080",
    "no_proxy": "localhost,127.0.0.1,.company.com",
    "has_dns": true,
    "hosts_count": 2
  }
]
```

### Switch with Preview (Dry-Run)

```bash
$ net-switch use company --dry-run
[DRY-RUN] Would apply profile: company
  HTTP_PROXY:  http://proxy.company.com:8080
  HTTPS_PROXY: http://proxy.company.com:8080
  NO_PROXY:    localhost,127.0.0.1,.company.com
  DNS:         [10.0.0.1 10.0.0.2]
  Hosts:       2 entries
```

### Switch for Real

```bash
$ net-switch use company
鉁?宸插垏鎹㈠埌: company
  鎻忚堪: 鍏徃鍐呯綉鐜
  HTTP_PROXY:  http://proxy.company.com:8080
  HTTPS_PROXY: http://proxy.company.com:8080
  NO_PROXY:    localhost,127.0.0.1,.company.com
  DNS:         [10.0.0.1 10.0.0.2]
  Hosts:       2 鏉¤褰?```

### Check Current Profile

```bash
$ net-switch current
Current profile: company
```

### System Status

```bash
$ net-switch status
Profile: company
HTTP Proxy: http://proxy.company.com:8080
HTTPS Proxy: http://proxy.company.com:8080
DNS: 10.0.0.1, 10.0.0.2
Hosts entries: 2
```

### Restore Previous State

```bash
$ net-switch restore
鉁?宸叉仮澶嶅埌涓婁竴娆＄殑缃戠粶閰嶇疆
```

### Encrypt / Decrypt Config

```bash
$ net-switch encrypt
鉁?閰嶇疆宸插姞瀵嗭紙AES-256-GCM锛?
$ net-switch decrypt
鉁?閰嶇疆宸茶В瀵?```

### Auto-Switch Rules

```bash
$ net-switch rules list
  NAME         ENABLED  TRIGGER         PROFILE
  office-wifi  true     SSID: CorpNet   company
  home-wifi    true     SSID: Home-5G   direct
  client-vpn   false    IP: 10.50.0.0/16  client

$ net-switch rules test "SSID: CorpNet"
鉁?Matched rule: office-wifi 鈫?company

$ net-switch rules disable office-wifi
鉁?Rule disabled: office-wifi
```

### Team Sync

```bash
$ net-switch auth login
鉁?Logged in as: dev@company.com

$ net-switch sync pull
鉁?Pulled 3 profiles from team server
  company (updated)
  staging (new)
  prod    (conflict 鈥?merged)

$ net-switch sync push
鉁?Pushed 1 profile to team server
  home-dev (created)
```

### Kubernetes Context Management

```bash
$ net-switch k8s list
  CONTEXT            CLUSTER       NAMESPACE   CURRENT
  minikube           minikube      default     鉁?  prod-cluster       eks-prod      kube-system
  staging-cluster    eks-staging   default

$ net-switch k8s switch prod-cluster
鉁?kubectl context switched to: prod-cluster

$ net-switch k8s ns monitoring
鉁?Namespace set to: monitoring
```

### Plugin Management

```bash
$ net-switch plugin list
  PLUGIN   VERSION  STATUS    DESCRIPTION
  k8s      0.1.0    active    Kubernetes context and namespace management
  echo     0.1.0    active    Example plugin that echoes profile switches

$ net-switch plugin info k8s
Name:        k8s-plugin
Version:     0.1.0
Author:      netenv
Description: Kubernetes context and namespace management plugin
Permissions: kubernetes, filesystem
Commands:    k8s list, k8s switch, k8s current, k8s ns
```

### Global Flags

```
--config string    Config file path (default: ./config.yaml or ~/.net-switch/config.yaml)
--dry-run          Preview mode 鈥?show what would change without modifying anything
--format string    Output format: text or json (default: text)
```

---

## Configuration

net-switch reads configuration from `./config.yaml` in the current directory or `~/.net-switch/config.yaml`.

```yaml
version: "1"
current_profile: company

profiles:
  - name: company
    description: "Corporate network"
    http_proxy: "http://proxy.corp.com:8080"
    https_proxy: "http://proxy.corp.com:8080"
    no_proxy: "localhost,127.0.0.1,.corp.com"
    dns:
      servers:
        - 10.0.0.53
        - 10.0.0.54
    hosts:
      - ip: 10.0.1.100
        hostname: "git.corp.com"
      - ip: 10.0.1.101
        hostname: "registry.corp.com"

  - name: home
    description: "Home network 鈥?no proxy"
    http_proxy: ""
    https_proxy: ""
    dns:
      servers:
        - 8.8.8.8
        - 1.1.1.1

  - name: cloud-dev
    description: "Cloud development cluster"
    http_proxy: "socks5://127.0.0.1:1080"
    https_proxy: "socks5://127.0.0.1:1080"
    no_proxy: "localhost,127.0.0.1,10.0.0.0/8"
    dns:
      servers:
        - 169.254.169.254
    hosts:
      - ip: 10.20.0.100
        hostname: "api.staging.internal"
      - ip: 10.20.0.101
        hostname: "db.staging.internal"
      - ip: 10.20.0.102
        hostname: "cache.staging.internal"

  - name: direct
    description: "Direct connection 鈥?no proxy, system DNS"
    http_proxy: ""
    https_proxy: ""
```

### Config Search Order

1. `--config` flag (highest priority)
2. `./config.yaml` in current working directory
3. `~/.net-switch/config.yaml` (user home)

---

## Plugin System

net-switch's plugin architecture is built around a clean `Plugin` interface with well-defined lifecycle hooks.

### Plugin Lifecycle

```
Init 鈫?Validate 鈫?Apply 鈫?Rollback 鈫?Cleanup
```

| Phase | When It Runs | Purpose |
|:------|:-------------|:--------|
| `Init` | Plugin loaded | Register commands, set up resources |
| `Validate` | Before switch | Verify profile is valid for this plugin |
| `Apply` | During switch | Execute the plugin's switching logic |
| `Rollback` | On failure | Undo partial changes |
| `Cleanup` | Plugin unloaded | Release resources |

### Inter-Plugin Communication

Plugins communicate through an **EventBus** 鈥?a pub/sub system that decouples plugins from each other. A plugin can emit events (e.g., `profile.switched`) and subscribe to events from other plugins.

### Built-in Plugins

| Plugin | Description |
|:-------|:------------|
| `k8s`  | Kubernetes context and namespace management plugin |
| `echo` | Example plugin that echoes profile switches |

### Writing a Plugin

Implement the `Plugin` interface in Go, create a `manifest.yaml`, and place the compiled binary in the plugins directory. See [CONTRIBUTING.md](CONTRIBUTING.md) for a full guide.

```go
type Plugin interface {
    Manifest() Manifest
    Init(ctx PluginContext) error
    Cleanup() error
    Validate(profile *config.Profile) error
    Apply(ctx *ExecutionContext) error
    Rollback(ctx *ExecutionContext) error
}
```

---

## Architecture

```
鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?   鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?鈹? CLI (cobra) 鈹?   鈹?GUI (Tauri) 鈹?鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹?   鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹?       鈹?                  鈹?       鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?                 鈹?       鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈻尖攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?       鈹?    Switcher       鈹?       鈹? (orchestration)   鈹?       鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?                 鈹?    鈹屸攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹尖攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?    鈹?           鈹?           鈹?鈹屸攢鈹€鈹€鈻尖攢鈹€鈹€鈹? 鈹屸攢鈹€鈹€鈹€鈻尖攢鈹€鈹€鈹€鈹? 鈹屸攢鈹€鈹€鈹€鈻尖攢鈹€鈹€鈹€鈹?鈹侼etwork鈹? 鈹?Plugin  鈹? 鈹?Crypto  鈹?鈹侻anager鈹? 鈹?System  鈹? 鈹?Module  鈹?鈹斺攢鈹€鈹€鈹攢鈹€鈹€鈹? 鈹斺攢鈹€鈹€鈹€鈹攢鈹€鈹€鈹€鈹? 鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?    鈹?          鈹?鈹屸攢鈹€鈹€鈻尖攢鈹€鈹€鈹? 鈹屸攢鈹€鈹€鈹€鈻尖攢鈹€鈹€鈹€鈹?鈹俉indows鈹? 鈹?K8s     鈹?鈹侺inux  鈹? 鈹?Rules   鈹?鈹俶acOS  鈹? 鈹?Sync    鈹?鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹? 鈹斺攢鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹?```

**Layer overview:**

- **CLI / GUI** 鈥?Two entry points sharing the same core logic. The CLI uses [cobra](https://github.com/spf13/cobra); the GUI uses Tauri with a React frontend.
- **Switcher** 鈥?The orchestration layer that coordinates profile application across all subsystems.
- **Network Manager** 鈥?Platform-specific implementations for proxy settings, DNS configuration, and hosts file management.
- **Plugin System** 鈥?Extensible architecture with EventBus, manifest-driven loading, and permission-based sandboxing.
- **Crypto Module** 鈥?AES-256-GCM encryption with PBKDF2 key derivation for config security.

---

## Comparison with CC-Switch

| Feature | net-switch | CC-Switch |
|:--------|:----------:|:---------:|
| CLI | 鉁?Full-featured | 鉁?Basic |
| GUI | 鉁?Tauri desktop | 鉂?None |
| Plugin System | 鉁?Extensible | 鉂?None |
| Config Encryption | 鉁?AES-256-GCM | 鉂?None |
| Auto-Switch Rules | 鉁?Domain/IP/SSID | 鉂?None |
| K8s Integration | 鉁?Context switching | 鉂?None |
| Team Sync | 鉁?REST API | 鉂?None |
| OAuth2 Auth | 鉁?PKCE flow | 鉂?None |
| Cross-Platform | 鉁?Win/Mac/Linux | 鈿狅笍 Partial |
| Config Format | 鉁?YAML | 鈿狅笍 JSON |
| Dry-Run Mode | 鉁?Built-in | 鉂?None |
| JSON Output | 鉁?All commands | 鉂?None |
| Open Source | 鉁?MIT | 鈿狅笍 Mixed |

---

## Contributing

We welcome contributions of all kinds 鈥?bug reports, feature requests, documentation, and code.

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request. It covers:

- Development environment setup
- Code style and conventions
- Plugin development guide
- Testing requirements
- Pull request process

### Quick Development Setup

```bash
git clone https://github.com/wuqi789/net-switch.git
cd net-switch
go build ./cmd/net-switch
./net-switch list
```

### Running Tests

```bash
go test ./...
```

---

## License

This project is licensed under the **MIT License** 鈥?see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024-2026 netenv

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

<p align="center">
  Made with 鉂わ笍 by <a href="https://github.com/netenv">netenv</a>
  <br/><br/>
  <a href="https://github.com/wuqi789/net-switch/stargazers">猸?Star us on GitHub</a> &bull;
  <a href="https://github.com/wuqi789/net-switch/issues">Report a Bug</a> &bull;
  <a href="https://github.com/wuqi789/net-switch/discussions">Join the Discussion</a>
</p>

<p align="center">
  <strong>Developer: 鍚存</strong> &bull; <a href="mailto:wuqi173@outlook.com">wuqi173@outlook.com</a>
</p>
