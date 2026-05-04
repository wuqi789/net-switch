package platform

type ProxyConfig struct {
	HTTP    string
	HTTPS   string
	SOCKS5  string
	PAC     string
	NoProxy []string
}

type DNSConfig struct {
	Servers       []string
	SearchDomains []string
}

type PlatformAdapter interface {
	SetProxy(config ProxyConfig) error
	ClearProxy() error
	SetDNS(config DNSConfig) error
	ClearDNS() error
	SetEnvVars(vars map[string]string) error
	GetEnvVars(keys []string) (map[string]string, error)
	FlushDNS() error
	RequiresElevation() bool
	PlatformName() string
}
