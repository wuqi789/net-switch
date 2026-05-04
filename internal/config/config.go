package config

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Global  *GlobalConfig
	Profile *Profile
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

	if err := yaml.Unmarshal(data, gc); err != nil {
		return nil, fmt.Errorf("failed to parse config file %s: %w", configPath, err)
	}

	return &Config{Global: gc}, nil
}

func LoadProfile(profilesDir, name string) (*Profile, error) {
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
	if profilesDir == "" {
		profilesDir = GetProfilesDir()
	}

	entries, err := os.ReadDir(profilesDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []string{}, nil
		}
		return nil, fmt.Errorf("failed to read profiles directory: %w", err)
	}

	var profiles []string
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		name := entry.Name()
		if strings.HasSuffix(name, ".yaml") || strings.HasSuffix(name, ".yml") {
			profiles = append(profiles, strings.TrimSuffix(strings.TrimSuffix(name, ".yaml"), ".yml"))
		}
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
