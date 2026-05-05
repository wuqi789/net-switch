package config

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"

	"gopkg.in/yaml.v3"
)

var (
	embeddedProfilesMu sync.Mutex
	embeddedProfiles   []Profile
)

func ensureEmbeddedProfiles() {
	embeddedProfilesMu.Lock()
	defer embeddedProfilesMu.Unlock()

	configPath := GetConfigFilePath()
	data, err := os.ReadFile(configPath)
	if err != nil {
		return
	}
	var cf ConfigFile
	if err := yaml.Unmarshal(data, &cf); err != nil {
		return
	}
	embeddedProfiles = cf.Profiles
}

type Config struct {
	Global  *GlobalConfig
	Profile *Profile
}

type ConfigFile struct {
	Version  string               `yaml:"version,omitempty"`
	LogLevel string               `yaml:"log_level,omitempty"`
	Color    *bool                `yaml:"color,omitempty"`
	Backup   *BackupConfig        `yaml:"backup,omitempty"`
	Plugins  *PluginsGlobalConfig `yaml:"plugins,omitempty"`
	Profiles []Profile            `yaml:"profiles,omitempty"`
}

func LoadConfig(configPath string) (*Config, error) {
	gc := DefaultGlobalConfig()

	if configPath == "" {
		configPath = GetConfigFilePath()
	}

	data, err := os.ReadFile(configPath)
	if err != nil {
		if os.IsNotExist(err) {
			return &Config{Global: gc}, nil
		}
		return nil, fmt.Errorf("failed to read config file %s: %w", configPath, err)
	}

	var cf ConfigFile
	if err := yaml.Unmarshal(data, &cf); err != nil {
		return nil, fmt.Errorf("failed to parse config file %s: %w", configPath, err)
	}

	if cf.Version != "" {
		gc.Version = cf.Version
	}
	if cf.LogLevel != "" {
		gc.LogLevel = cf.LogLevel
	}
	if cf.Color != nil {
		gc.Color = *cf.Color
	}
	if cf.Backup != nil {
		gc.Backup = *cf.Backup
	}
	if cf.Plugins != nil {
		gc.Plugins = *cf.Plugins
	}

	embeddedProfilesMu.Lock()
	embeddedProfiles = cf.Profiles
	embeddedProfilesMu.Unlock()

	return &Config{Global: gc}, nil
}

func LoadProfile(profilesDir, name string) (*Profile, error) {
	ensureEmbeddedProfiles()

	embeddedProfilesMu.Lock()
	for _, ep := range embeddedProfiles {
		if ep.Name == name {
			p := ep
			embeddedProfilesMu.Unlock()
			return &p, nil
		}
	}
	embeddedProfilesMu.Unlock()

	if profilesDir == "" {
		profilesDir = GetProfilesDir()
	}

	profilePath := filepath.Join(profilesDir, name+".yaml")
	data, err := os.ReadFile(profilePath)
	if err != nil {
		return nil, fmt.Errorf("failed to read profile %s: %w", profilePath, err)
	}

	profile := DefaultProfile()
	if err := yaml.Unmarshal(data, profile); err != nil {
		return nil, fmt.Errorf("failed to parse profile %s: %w", profilePath, err)
	}

	if profile.Name == "" {
		profile.Name = name
	}

	return profile, nil
}

func MergeProfile(base, overlay *Profile) *Profile {
	if base == nil {
		return overlay
	}
	if overlay == nil {
		return base
	}

	merged := *base

	if overlay.Name != "" {
		merged.Name = overlay.Name
	}
	if overlay.Description != "" {
		merged.Description = overlay.Description
	}

	if overlay.Proxy.Enabled {
		merged.Proxy = overlay.Proxy
	}

	if overlay.DNS.Enabled {
		merged.DNS = overlay.DNS
	}

	if overlay.Hosts.Enabled {
		merged.Hosts = overlay.Hosts
	}

	if overlay.EnvVars.Enabled {
		merged.EnvVars = overlay.EnvVars
	}

	if len(overlay.Plugins) > 0 {
		merged.Plugins = overlay.Plugins
	}

	return &merged
}

func SaveProfile(profilesDir string, profile *Profile) error {
	if profilesDir == "" {
		profilesDir = GetProfilesDir()
	}

	if err := os.MkdirAll(profilesDir, 0755); err != nil {
		return fmt.Errorf("failed to create profiles directory: %w", err)
	}

	data, err := yaml.Marshal(profile)
	if err != nil {
		return fmt.Errorf("failed to marshal profile: %w", err)
	}

	profilePath := filepath.Join(profilesDir, profile.Name+".yaml")
	if err := os.WriteFile(profilePath, data, 0644); err != nil {
		return fmt.Errorf("failed to write profile: %w", err)
	}

	return nil
}

func ListProfiles(profilesDir string) ([]string, error) {
	ensureEmbeddedProfiles()

	if profilesDir == "" {
		profilesDir = GetProfilesDir()
	}

	nameSet := make(map[string]bool)

	embeddedProfilesMu.Lock()
	for _, ep := range embeddedProfiles {
		if ep.Name != "" {
			nameSet[ep.Name] = true
		}
	}
	embeddedProfilesMu.Unlock()

	entries, err := os.ReadDir(profilesDir)
	if err != nil {
		if !os.IsNotExist(err) {
			return nil, fmt.Errorf("failed to read profiles directory: %w", err)
		}
	} else {
		for _, entry := range entries {
			if entry.IsDir() {
				continue
			}
			name := entry.Name()
			if strings.HasSuffix(name, ".yaml") || strings.HasSuffix(name, ".yml") {
				n := strings.TrimSuffix(strings.TrimSuffix(name, ".yaml"), ".yml")
				nameSet[n] = true
			}
		}
	}

	var profiles []string
	for n := range nameSet {
		profiles = append(profiles, n)
	}

	sort.Strings(profiles)
	return profiles, nil
}

func SaveGlobalConfig(configPath string, gc *GlobalConfig) error {
	if configPath == "" {
		configPath = GetConfigFilePath()
	}

	dir := filepath.Dir(configPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	data, err := yaml.Marshal(gc)
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	if err := os.WriteFile(configPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config: %w", err)
	}

	return nil
}

func LoadProjectConfig(projectDir string) (*Profile, error) {
	configPath := filepath.Join(projectDir, ".netenv.yaml")
	data, err := os.ReadFile(configPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to read project config: %w", err)
	}

	profile := DefaultProfile()
	if err := yaml.Unmarshal(data, profile); err != nil {
		return nil, fmt.Errorf("failed to parse project config: %w", err)
	}

	return profile, nil
}
