package config

import (
	"strings"

	"gopkg.in/yaml.v3"
)

type Profile struct {
	Name        string         `yaml:"name"`
	Description string         `yaml:"description,omitempty"`
	Proxy       ProxyConfig    `yaml:"proxy"`
	DNS         DNSConfig      `yaml:"dns"`
	Hosts       HostsConfig    `yaml:"hosts"`
	EnvVars     EnvVarsConfig  `yaml:"env_vars"`
	Plugins     []PluginConfig `yaml:"plugins,omitempty"`
}

type ProxyConfig struct {
	Enabled bool     `yaml:"enabled"`
	HTTP    string   `yaml:"http,omitempty"`
	HTTPS   string   `yaml:"https,omitempty"`
	SOCKS5  string   `yaml:"socks5,omitempty"`
	PAC     string   `yaml:"pac,omitempty"`
	NoProxy []string `yaml:"no_proxy,omitempty"`
}

type DNSConfig struct {
	Enabled       bool            `yaml:"enabled"`
	Servers       []string        `yaml:"servers,omitempty"`
	SearchDomains []string        `yaml:"search_domains,omitempty"`
	SplitDNS      []SplitDNSEntry `yaml:"split_dns,omitempty"`
}

type SplitDNSEntry struct {
	Domain  string   `yaml:"domain"`
	Servers []string `yaml:"servers"`
}

type HostsConfig struct {
	Enabled bool         `yaml:"enabled"`
	Entries []HostsEntry `yaml:"entries,omitempty"`
}

func (h *HostsConfig) UnmarshalYAML(value *yaml.Node) error {
	if value.Kind == yaml.SequenceNode {
		h.Enabled = len(value.Content) > 0
		h.Entries = nil
		for _, node := range value.Content {
			var entry HostsEntry
			if err := node.Decode(&entry); err != nil {
				return err
			}
			h.Entries = append(h.Entries, entry)
		}
		return nil
	}

	type rawHostsConfig HostsConfig
	var raw rawHostsConfig
	if err := value.Decode(&raw); err != nil {
		return err
	}
	*h = HostsConfig(raw)
	return nil
}

type HostsEntry struct {
	IP       string `yaml:"ip"`
	Hostname string `yaml:"hostname"`
	Comment  string `yaml:"comment,omitempty"`
}

type EnvVarsConfig struct {
	Enabled   bool              `yaml:"enabled"`
	Variables map[string]string `yaml:"variables,omitempty"`
}

type PluginConfig struct {
	Name    string                 `yaml:"name"`
	Enabled bool                   `yaml:"enabled"`
	Config  map[string]interface{} `yaml:"config,omitempty"`
}

type flatProfile struct {
	Name        string      `yaml:"name"`
	Description string      `yaml:"description,omitempty"`
	HTTPProxy   string      `yaml:"http_proxy,omitempty"`
	HTTPSProxy  string      `yaml:"https_proxy,omitempty"`
	SOCKS5Proxy string      `yaml:"socks5_proxy,omitempty"`
	NoProxy     interface{} `yaml:"no_proxy,omitempty"`
	DNSServers  []string    `yaml:"dns_servers,omitempty"`
	DNSSearch   []string    `yaml:"dns_search_domains,omitempty"`
	Hosts       HostsConfig `yaml:"hosts"`
	EnvVars     interface{} `yaml:"env_vars,omitempty"`
}

type nestedProfile struct {
	Name        string         `yaml:"name"`
	Description string         `yaml:"description,omitempty"`
	Proxy       ProxyConfig    `yaml:"proxy"`
	DNS         DNSConfig      `yaml:"dns"`
	Hosts       HostsConfig    `yaml:"hosts"`
	EnvVars     EnvVarsConfig  `yaml:"env_vars"`
	Plugins     []PluginConfig `yaml:"plugins,omitempty"`
}

func (p *Profile) UnmarshalYAML(value *yaml.Node) error {
	var nested nestedProfile
	nestedErr := value.Decode(&nested)

	var flat flatProfile
	flatErr := value.Decode(&flat)

	if flatErr != nil && nestedErr != nil {
		return flatErr
	}

	p.Name = flat.Name
	if p.Name == "" {
		p.Name = nested.Name
	}
	p.Description = flat.Description
	if p.Description == "" {
		p.Description = nested.Description
	}
	p.Plugins = nested.Plugins

	if flat.HTTPProxy != "" || flat.HTTPSProxy != "" || flat.SOCKS5Proxy != "" {
		p.Proxy = ProxyConfig{
			Enabled: true,
			HTTP:    flat.HTTPProxy,
			HTTPS:   flat.HTTPSProxy,
			SOCKS5:  flat.SOCKS5Proxy,
		}
		p.Proxy.NoProxy = parseNoProxy(flat.NoProxy)
	} else if nestedErr == nil {
		p.Proxy = nested.Proxy
	}

	if nestedErr == nil && len(nested.DNS.Servers) > 0 {
		p.DNS = nested.DNS
		p.DNS.Enabled = true
	} else if flatErr == nil && len(flat.DNSServers) > 0 {
		p.DNS = DNSConfig{
			Enabled:       true,
			Servers:       flat.DNSServers,
			SearchDomains: flat.DNSSearch,
		}
	}

	p.Hosts = flat.Hosts
	if len(p.Hosts.Entries) > 0 {
		p.Hosts.Enabled = true
	}

	if nestedErr == nil && nested.EnvVars.Variables != nil && len(nested.EnvVars.Variables) > 0 {
		p.EnvVars = nested.EnvVars
		p.EnvVars.Enabled = true
	} else if flatEnv, ok := flat.EnvVars.(map[string]interface{}); ok && len(flatEnv) > 0 {
		p.EnvVars = EnvVarsConfig{Enabled: true, Variables: make(map[string]string)}
		for k, v := range flatEnv {
			if s, ok := v.(string); ok {
				p.EnvVars.Variables[k] = s
			}
		}
	}

	return nil
}

func parseNoProxy(v interface{}) []string {
	switch np := v.(type) {
	case string:
		var result []string
		for _, s := range strings.Split(np, ",") {
			s = strings.TrimSpace(s)
			if s != "" {
				result = append(result, s)
			}
		}
		return result
	case []interface{}:
		var result []string
		for _, item := range np {
			if s, ok := item.(string); ok {
				result = append(result, s)
			}
		}
		return result
	}
	return nil
}
