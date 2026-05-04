package state

import "time"

type Snapshot struct {
	Timestamp   time.Time          `yaml:"timestamp"`
	ProfileName string             `yaml:"profile_name"`
	Proxy       *ProxyState        `yaml:"proxy,omitempty"`
	DNS         *DNSState          `yaml:"dns,omitempty"`
	Hosts       *HostsState        `yaml:"hosts,omitempty"`
	EnvVars     map[string]string  `yaml:"env_vars,omitempty"`
	Metadata    map[string]interface{} `yaml:"metadata,omitempty"`
}

type ProxyState struct {
	HTTP    string   `yaml:"http,omitempty"`
	HTTPS   string   `yaml:"https,omitempty"`
	SOCKS5  string   `yaml:"socks5,omitempty"`
	PAC     string   `yaml:"pac,omitempty"`
	NoProxy []string `yaml:"no_proxy,omitempty"`
}

type DNSState struct {
	Servers       []string `yaml:"servers,omitempty"`
	SearchDomains []string `yaml:"search_domains,omitempty"`
}

type HostsState struct {
	Entries []HostsEntryState `yaml:"entries,omitempty"`
}

type HostsEntryState struct {
	IP       string `yaml:"ip"`
	Hostname string `yaml:"hostname"`
	Comment  string `yaml:"comment,omitempty"`
}
