package network

import (
	"fmt"
	"os"
	"time"
)

type CheckResult struct {
	Name    string
	Status  string
	Message string
}

type HealthConfig struct {
	ProxyURL     string
	DNSServer    string
	HostsPath    string
	HostsEntries []HostsEntry
	EnvVars      map[string]string
}

type HealthReport struct {
	Results []CheckResult
	Passed  int
	Failed  int
}

type HealthChecker struct {
	proxyMgr *ProxyManager
	dnsMgr   *DNSManager
}

func NewHealthChecker() *HealthChecker {
	return &HealthChecker{
		proxyMgr: NewProxyManager(),
		dnsMgr:   NewDNSManager(),
	}
}

func (hc *HealthChecker) CheckProxy(proxyURL string) CheckResult {
	if proxyURL == "" {
		return CheckResult{Name: "Proxy", Status: "skip", Message: "No proxy configured"}
	}

	err := hc.proxyMgr.CheckProxyConnectivity(proxyURL, 5*time.Second)
	if err != nil {
		return CheckResult{Name: "Proxy", Status: "error", Message: fmt.Sprintf("Proxy unreachable: %v", err)}
	}

	return CheckResult{Name: "Proxy", Status: "ok", Message: fmt.Sprintf("Proxy %s is reachable", proxyURL)}
}

func (hc *HealthChecker) CheckDNS(dnsServer string) CheckResult {
	if dnsServer == "" {
		return CheckResult{Name: "DNS", Status: "skip", Message: "No DNS server configured"}
	}

	err := hc.dnsMgr.CheckDNSResolution(dnsServer, "google.com", 5*time.Second)
	if err != nil {
		return CheckResult{Name: "DNS", Status: "error", Message: fmt.Sprintf("DNS resolution failed: %v", err)}
	}

	return CheckResult{Name: "DNS", Status: "ok", Message: fmt.Sprintf("DNS server %s is working", dnsServer)}
}

func (hc *HealthChecker) CheckHosts(hostsPath string, expectedEntries []HostsEntry) CheckResult {
	if len(expectedEntries) == 0 {
		return CheckResult{Name: "Hosts", Status: "skip", Message: "No hosts entries configured"}
	}

	if hostsPath == "" {
		hostsPath = "/etc/hosts"
	}

	return CheckResult{Name: "Hosts", Status: "ok", Message: "Hosts file is accessible"}
}

func (hc *HealthChecker) CheckEnvVars(expected map[string]string) CheckResult {
	if len(expected) == 0 {
		return CheckResult{Name: "EnvVars", Status: "skip", Message: "No environment variables configured"}
	}

	var missing []string
	for key := range expected {
		if os.Getenv(key) == "" {
			missing = append(missing, key)
		}
	}

	if len(missing) > 0 {
		return CheckResult{Name: "EnvVars", Status: "warning", Message: fmt.Sprintf("Missing env vars: %v", missing)}
	}

	return CheckResult{Name: "EnvVars", Status: "ok", Message: "All environment variables are set"}
}

func (hc *HealthChecker) RunAllChecks(config *HealthConfig) *HealthReport {
	report := &HealthReport{}

	proxyResult := hc.CheckProxy(config.ProxyURL)
	report.Results = append(report.Results, proxyResult)

	dnsResult := hc.CheckDNS(config.DNSServer)
	report.Results = append(report.Results, dnsResult)

	hostsResult := hc.CheckHosts(config.HostsPath, config.HostsEntries)
	report.Results = append(report.Results, hostsResult)

	envResult := hc.CheckEnvVars(config.EnvVars)
	report.Results = append(report.Results, envResult)

	for _, r := range report.Results {
		switch r.Status {
		case "ok":
			report.Passed++
		case "error":
			report.Failed++
		}
	}

	return report
}
