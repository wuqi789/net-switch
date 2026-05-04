package config

import (
	"fmt"
	"net"
	"net/url"
	"strings"
)

func Validate(profile *Profile) []error {
	var errs []error

	if profile.Name == "" {
		errs = append(errs, fmt.Errorf("profile name is required"))
	}

	if profile.Proxy.Enabled {
		errs = append(errs, validateProxy(profile.Proxy)...)
	}

	if profile.DNS.Enabled {
		errs = append(errs, validateDNS(profile.DNS)...)
	}

	if profile.Hosts.Enabled {
		errs = append(errs, validateHosts(profile.Hosts)...)
	}

	if profile.EnvVars.Enabled {
		errs = append(errs, validateEnvVars(profile.EnvVars)...)
	}

	return errs
}

func validateProxy(pc ProxyConfig) []error {
	var errs []error

	if pc.HTTP != "" {
		if _, err := url.Parse(pc.HTTP); err != nil {
			errs = append(errs, fmt.Errorf("invalid HTTP proxy URL %q: %w", pc.HTTP, err))
		}
	}

	if pc.HTTPS != "" {
		if _, err := url.Parse(pc.HTTPS); err != nil {
			errs = append(errs, fmt.Errorf("invalid HTTPS proxy URL %q: %w", pc.HTTPS, err))
		}
	}

	if pc.SOCKS5 != "" {
		if _, err := url.Parse(pc.SOCKS5); err != nil {
			errs = append(errs, fmt.Errorf("invalid SOCKS5 proxy URL %q: %w", pc.SOCKS5, err))
		}
	}

	if pc.PAC != "" {
		if _, err := url.Parse(pc.PAC); err != nil {
			errs = append(errs, fmt.Errorf("invalid PAC proxy URL %q: %w", pc.PAC, err))
		}
	}

	return errs
}

func validateDNS(dc DNSConfig) []error {
	var errs []error

	if len(dc.Servers) == 0 {
		errs = append(errs, fmt.Errorf("DNS servers list cannot be empty when DNS is enabled"))
	}

	for _, server := range dc.Servers {
		if ip := net.ParseIP(server); ip == nil {
			errs = append(errs, fmt.Errorf("invalid DNS server address %q", server))
		}
	}

	for _, entry := range dc.SplitDNS {
		if entry.Domain == "" {
			errs = append(errs, fmt.Errorf("split DNS domain cannot be empty"))
		}
		if len(entry.Servers) == 0 {
			errs = append(errs, fmt.Errorf("split DNS servers cannot be empty for domain %q", entry.Domain))
		}
		for _, server := range entry.Servers {
			if ip := net.ParseIP(server); ip == nil {
				errs = append(errs, fmt.Errorf("invalid split DNS server address %q for domain %q", server, entry.Domain))
			}
		}
	}

	return errs
}

func validateHosts(hc HostsConfig) []error {
	var errs []error

	for i, entry := range hc.Entries {
		if entry.IP == "" {
			errs = append(errs, fmt.Errorf("hosts entry %d: IP address cannot be empty", i))
		} else if ip := net.ParseIP(entry.IP); ip == nil {
			if !strings.Contains(entry.IP, ":") {
				errs = append(errs, fmt.Errorf("hosts entry %d: invalid IP address %q", i, entry.IP))
			}
		}
		if entry.Hostname == "" {
			errs = append(errs, fmt.Errorf("hosts entry %d: hostname cannot be empty", i))
		}
	}

	return errs
}

func validateEnvVars(ec EnvVarsConfig) []error {
	var errs []error

	for key := range ec.Variables {
		if strings.TrimSpace(key) == "" {
			errs = append(errs, fmt.Errorf("environment variable key cannot be empty"))
		}
	}

	return errs
}
