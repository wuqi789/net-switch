package config

import (
	"os"
	"path/filepath"
	"runtime"
)

type GlobalConfig struct {
	Version        string             `yaml:"version"`
	DefaultProfile string             `yaml:"default_profile,omitempty"`
	LogLevel       string             `yaml:"log_level"`
	Color          bool               `yaml:"color"`
	Backup         BackupConfig       `yaml:"backup"`
	Plugins        PluginsGlobalConfig `yaml:"plugins"`
}

type BackupConfig struct {
	Enabled    bool   `yaml:"enabled"`
	MaxHistory int    `yaml:"max_history"`
	Directory  string `yaml:"directory"`
}

type PluginsGlobalConfig struct {
	Directory string   `yaml:"directory"`
	Enabled   []string `yaml:"enabled"`
}

func DefaultGlobalConfig() *GlobalConfig {
	return &GlobalConfig{
		Version:        "1",
		DefaultProfile: "",
		LogLevel:       "info",
		Color:          true,
		Backup: BackupConfig{
			Enabled:    true,
			MaxHistory: 20,
			Directory:  "~/.netenv/state",
		},
		Plugins: PluginsGlobalConfig{
			Directory: "~/.netenv/plugins",
			Enabled:   []string{},
		},
	}
}

func DefaultProfile() *Profile {
	return &Profile{
		Name:        "",
		Description: "",
		Proxy: ProxyConfig{
			Enabled: false,
		},
		DNS: DNSConfig{
			Enabled: false,
		},
		Hosts: HostsConfig{
			Enabled: false,
		},
		EnvVars: EnvVarsConfig{
			Enabled:   false,
			Variables: make(map[string]string),
		},
		Plugins: []PluginConfig{},
	}
}

func GetNetenvDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		if runtime.GOOS == "windows" {
			home = os.Getenv("USERPROFILE")
		} else {
			home = os.Getenv("HOME")
		}
	}

	switchDir := filepath.Join(home, ".net-switch")
	if _, err := os.Stat(filepath.Join(switchDir, "config.yaml")); err == nil {
		return switchDir
	}

	netenvDir := filepath.Join(home, ".netenv")
	if _, err := os.Stat(filepath.Join(netenvDir, "config.yaml")); err == nil {
		return netenvDir
	}

	return switchDir
}

func GetProfilesDir() string {
	return filepath.Join(GetNetenvDir(), "profiles")
}

func GetStateDir() string {
	return filepath.Join(GetNetenvDir(), "state")
}

func GetConfigFilePath() string {
	return filepath.Join(GetNetenvDir(), "config.yaml")
}
