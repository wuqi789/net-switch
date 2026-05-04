package network

import (
	"fmt"
	"net"
	"net/url"
	"strings"
	"time"
)

type ProxyConfig struct {
	HTTP    string
	HTTPS   string
	SOCKS5  string
	PAC     string
	NoProxy []string
}

type ProxyManager struct{}

func NewProxyManager() *ProxyManager {
	return &ProxyManager{}
}

func (p *ProxyManager) ValidateProxyURL(proxyURL string) error {
	if proxyURL == "" {
		return fmt.Errorf("proxy URL cannot be empty")
	}

	u, err := url.Parse(proxyURL)
	if err != nil {
		return fmt.Errorf("invalid proxy URL: %w", err)
	}

	if u.Scheme == "" {
		return fmt.Errorf("proxy URL must have a scheme (http, https, socks5)")
	}

	if u.Host == "" {
		return fmt.Errorf("proxy URL must have a host")
	}

	return nil
}

func (p *ProxyManager) CheckProxyConnectivity(proxyURL string, timeout time.Duration) error {
	if timeout == 0 {
		timeout = 5 * time.Second
	}

	u, err := url.Parse(proxyURL)
	if err != nil {
		return fmt.Errorf("invalid proxy URL: %w", err)
	}

	host := u.Host
	if !strings.Contains(host, ":") {
		host += ":8080"
	}

	conn, err := net.DialTimeout("tcp", host, timeout)
	if err != nil {
		return fmt.Errorf("proxy %s is not reachable: %w", proxyURL, err)
	}
	conn.Close()

	return nil
}

func (p *ProxyManager) BuildProxyEnvVars(config ProxyConfig) map[string]string {
	vars := make(map[string]string)

	if config.HTTP != "" {
		vars["HTTP_PROXY"] = config.HTTP
		vars["http_proxy"] = config.HTTP
	}

	if config.HTTPS != "" {
		vars["HTTPS_PROXY"] = config.HTTPS
		vars["https_proxy"] = config.HTTPS
	}

	if config.SOCKS5 != "" {
		vars["ALL_PROXY"] = config.SOCKS5
		vars["all_proxy"] = config.SOCKS5
	}

	if len(config.NoProxy) > 0 {
		noProxy := strings.Join(config.NoProxy, ",")
		vars["NO_PROXY"] = noProxy
		vars["no_proxy"] = noProxy
	}

	return vars
}
