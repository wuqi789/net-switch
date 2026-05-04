<h1 align="center">net-switch</h1>

<p align="center">
  <strong>The developer's network environment switcher — CLI + GUI, plugin-powered, team-ready.</strong>
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

Every developer juggles multiple network environments daily — corporate proxies at the office, direct connections at home, VPN tunnels for client access, cloud-specific DNS for remote clusters. Each switch means manually updating `HTTP_PROXY`, `HTTPS_PROXY`, `NO_PROXY`, DNS servers, and `/etc/hosts` entries. Miss one setting and you'll spend 30 minutes debugging a connection that "just worked yesterday." Multiply this by every tool on your machine that respects proxy environment variables (Docker, npm, pip, kubectl, git) and the toil adds up fast.

Current workarounds range from shell aliases and dotfile scripts to platform-specific GUIs that only handle one piece of the puzzle. None of them give you a **single source of truth** for your entire network footprint — proxy, DNS, hosts, and tool-specific configs — let alone the ability to share those configs with your team, encrypt secrets at rest, or trigger switches automatically based on the Wi-Fi network you just joined.

**net-switch** changes that. Define your environments once in a YAML file. Switch between them with a single command. Let rules detect your context and switch automatically. Share profiles with your team through encrypted sync. And when you need a visual overview, launch the desktop GUI — all from the same project, the same config, the same workflow.

---

## Features

| Feature | Description |
|:--------|:------------|
| ⚡ **One-Command Switch** | Set proxy, DNS, hosts, and env vars in a single `netenv use <profile>` |
| 🔌 **Plugin System** | Interface-based architecture with EventBus, lifecycle hooks, and manifest-driven loading |
| 🔒 **Config Encryption** | AES-256-GCM field-level encryption with PBKDF2 key derivation — secrets stay safe at rest |
| 🔄 **Auto-Switch Rules** | Trigger profile changes on domain, IP, SSID, or process detection |
| ☸️ **Kubernetes Integration** | List, switch, and namespace-manage kubectl contexts from the CLI |
| 👥 **Team Sync** | Pull/push profiles via REST API with conflict resolution and merge strategies |
| 🖥️ **GUI Desktop App** | Tauri v2 + React 18 + TypeScript + Tailwind CSS native desktop application |
| 🌐 **Cross-Platform** | Windows, macOS, and Linux — ARM64 and AMD64 |
| 🧪 **Dry-Run Mode** | Preview every change before it happens with `--dry-run` |
| 📜 **JSON Output** | Machine-readable `--format json` on every command for scripting and CI |
| 🔑 **OAuth2 + PKCE** | Secure team authentication without sharing passwords |


---

## Quick Start

**1 — Install the CLI (Recommended)**

Download the pre-built binary for your platform from the [Releases](https://github.com/wuqi789/net-switch/releases) page:

| Platform | File |
|:---------|:-----|
| Windows  | `windows-x86_64.zip` |
| macOS (Apple Silicon) | `macos-aarch64-apple-darwin.zip` |
| macOS (Intel) | `macos-x86_64-apple-darwin.zip` |

Extract the archive and add the binary to your PATH.

**2 — Switch (Administrator privileges)**

```bash
netenv use office
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
├── net-switch/          # CLI project (this repo)
└── net-switch-gui/      # GUI project (separate repo)
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
$ netenv list
Available network environments:
─────────────────────────────────────
▸ company  -  Corporate network
  vpn      -  VPN environment
  test     -  Test environment
  direct   -  Direct connection (no proxy)
─────────────────────────────────────
Use 'netenv use <profile>' to switch environment
```

JSON output for scripting:

```bash
$ netenv list --format json
[
  {
    "name": "company",
    "description": "Corporate network",
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
$ netenv use company --dry-run
[DRY-RUN] Would apply profile: company
  HTTP_PROXY:  http://proxy.company.com:8080
  HTTPS_PROXY: http://proxy.company.com:8080
  NO_PROXY:    localhost,127.0.0.1,.company.com
  DNS:         [10.0.0.1 10.0.0.2]
  Hosts:       2 entries
```

### Switch for Real

```bash
$ netenv use company
✓ Switched to: company
  Description: Corporate network
  HTTP_PROXY:  http://proxy.company.com:8080
  HTTPS_PROXY: http://proxy.company.com:8080
  NO_PROXY:    localhost,127.0.0.1,.company.com
  DNS:         [10.0.0.1 10.0.0.2]
  Hosts:       2 entries
```

### Check Current Profile

```bash
$ netenv current
Current profile: company
```

### System Status

```bash
$ netenv status
Profile: company
HTTP Proxy: http://proxy.company.com:8080
HTTPS Proxy: http://proxy.company.com:8080
DNS: 10.0.0.1, 10.0.0.2
Hosts entries: 2
```

### Restore Previous State

```bash
$ netenv restore
✓ Restored to previous network configuration
```

### Encrypt / Decrypt Config

```bash
$ netenv encrypt
✓ Configuration encrypted (AES-256-GCM)
$ netenv decrypt
✓ Configuration decrypted
```

### Auto-Switch Rules

```bash
$ netenv rules list
  NAME         ENABLED  TRIGGER         PROFILE
  office-wifi  true     SSID: CorpNet   company
  home-wifi    true     SSID: Home-5G   direct
  client-vpn   false    IP: 10.50.0.0/16  client

$ netenv rules test "SSID: CorpNet"
✓ Matched rule: office-wifi → company

$ netenv rules disable office-wifi
✓ Rule disabled: office-wifi
```

### Team Sync

```bash
$ netenv auth login
✓ Logged in as: dev@company.com

$ netenv sync pull
✓ Pulled 3 profiles from team server
  company (updated)
  staging (new)
  prod    (conflict — merged)

$ netenv sync push
✓ Pushed 1 profile to team server
  home-dev (created)
```

### Kubernetes Context Management

```bash
$ netenv k8s list
  CONTEXT            CLUSTER       NAMESPACE   CURRENT
  minikube           minikube      default     ✓
  prod-cluster       eks-prod      kube-system
  staging-cluster    eks-staging   default

$ netenv k8s switch prod-cluster
✓ kubectl context switched to: prod-cluster

$ netenv k8s ns monitoring
✓ Namespace set to: monitoring
```

### Plugin Management

```bash
$ netenv plugin list
  PLUGIN   VERSION  STATUS    DESCRIPTION
  k8s      0.1.0    active    Kubernetes context and namespace management
  echo     0.1.0    active    Example plugin that echoes profile switches

$ netenv plugin info k8s
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
┌─────────────┐    ┌─────────────┐
│  CLI (cobra) │    │ GUI (Tauri) │
└──────┬──────┘    └──────┬──────┘
       │                   │
       └─────────┬─────────┘
                 │
       ┌─────────▼─────────┐
       │     Switcher       │
       │  (orchestration)   │
       └─────────┬─────────┘
                 │
    ┌────────────┼────────────┐
    │            │            │
┌───▼───┐  ┌────▼────┐  ┌────▼────┐
│Network│  │ Plugin  │  │ Crypto  │
│Manager│  │ System  │  │ Module  │
└───┬───┘  └────┬────┘  └─────────┘
    │           │
┌───▼───┐  ┌────▼────┐
│Windows│  │ K8s     │
│Linux  │  │ Rules   │
│macOS  │  │ Sync    │
└───────┘  └─────────┘
```

**Layer overview:**

- **CLI / GUI** — Two entry points sharing the same core logic. The CLI uses [cobra](https://github.com/spf13/cobra); the GUI uses Tauri with a React frontend.
- **Switcher** — The orchestration layer that coordinates profile application across all subsystems.
- **Network Manager** — Platform-specific implementations for proxy settings, DNS configuration, and hosts file management.
- **Plugin System** — Extensible architecture with EventBus, manifest-driven loading, and permission-based sandboxing.
- **Crypto Module** — AES-256-GCM encryption with PBKDF2 key derivation for config security.

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
