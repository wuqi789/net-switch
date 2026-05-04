package network

import (
	"context"
	"fmt"
	"net"
	"time"
)

type DNSConfig struct {
	Servers       []string
	SearchDomains []string
}

type DNSManager struct{}

func NewDNSManager() *DNSManager {
	return &DNSManager{}
}

func (d *DNSManager) ValidateDNSServer(server string) error {
	if server == "" {
		return fmt.Errorf("DNS server address cannot be empty")
	}

	if ip := net.ParseIP(server); ip == nil {
		return fmt.Errorf("invalid DNS server address: %s", server)
	}

	return nil
}

func (d *DNSManager) CheckDNSResolution(dnsServer, domain string, timeout time.Duration) error {
	if timeout == 0 {
		timeout = 5 * time.Second
	}

	resolver := &net.Resolver{
		PreferGo: true,
		Dial: func(ctx context.Context, network, address string) (net.Conn, error) {
			d := net.Dialer{Timeout: timeout}
			return d.DialContext(ctx, "udp", dnsServer+":53")
		},
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	addrs, err := resolver.LookupHost(ctx, domain)
	if err != nil {
		return fmt.Errorf("DNS resolution failed for %s using %s: %w", domain, dnsServer, err)
	}

	if len(addrs) == 0 {
		return fmt.Errorf("DNS resolution returned no addresses for %s", domain)
	}

	return nil
}
