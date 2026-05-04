package config

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
