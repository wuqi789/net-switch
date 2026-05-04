package config

import "gopkg.in/yaml.v3"

type Profile struct {
	Name        string         `yaml:"name"`
	Description string         `yaml:"description,omitempty"`
	Proxy       ProxyConfig    `yaml:"proxy"`
	DNS         DNSConfig      `yaml:"dns"`
	Hosts       HostsConfig    `yaml:"hosts"`
	EnvVars     EnvVarsConfig  `yaml:"env_vars"`
	Plugins     []PluginConfig `yaml:"plugins,omitempty"`
}

type flatProfile struct {
	Name        string         `yaml:"name"`
	Description string         `yaml:"description,omitempty"`
	HTTPProxy   string         `yaml:"http_proxy,omitempty"`
	HTTPSProxy  string         `yaml:"https_proxy,omitempty"`
	SOCKS5Proxy string         `yaml:"socks5_proxy,omitempty"`
	NoProxy     []string       `yaml:"no_proxy,omitempty"`
	Hosts       HostsConfig    `yaml:"hosts"`
	DNSServers  []string       `yaml:"dns_servers,omitempty"`
	DNSSearch   []string       `yaml:"dns_search_domains,omitempty"`
	EnvVars     map[string]string `yaml:"env_vars,omitempty"`
}

func (p *Profile) UnmarshalYAML(value *yaml.Node) error {
	type nestedProfile Profile
	var nested nestedProfile
	if err := value.Decode(&nested); err == nil {
		if nested.Proxy.HTTP != "" || nested.Proxy.HTTPS != "" || nested.Proxy.Enabled ||
			nested.DNS.Enabled || len(nested.DNS.Servers) > 0 ||
			nested.Hosts.Enabled {
			*p = Profile(nested)
			return nil
		}
	}

	var flat flatProfile
	if err := value.Decode(&flat); err != nil {
		return err
	}

	p.Name = flat.Name
	p.Description = flat.Description
	p.Hosts = flat.Hosts
	p.EnvVars = EnvVarsConfig{Enabled: len(flat.EnvVars) > 0, Variables: flat.EnvVars}
	p.Plugins = nil

	p.Proxy = ProxyConfig{
		Enabled: flat.HTTPProxy != "" || flat.HTTPSProxy != "" || flat.SOCKS5Proxy != "",
		HTTP:    flat.HTTPProxy,
		HTTPS:   flat.HTTPSProxy,
		SOCKS5:  flat.SOCKS5Proxy,
		NoProxy: flat.NoProxy,
	}
	p.DNS = DNSConfig{
		Enabled:       len(flat.DNSServers) > 0,
		Servers:       flat.DNSServers,
		SearchDomains: flat.DNSSearch,
	}

	return nil
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
