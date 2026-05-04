//go:build darwin

package platform

import (
	"fmt"
	"os"
	"os/exec"
	"strings"
)

type darwinAdapter struct{}

func newDarwinAdapter() *darwinAdapter {
	return &darwinAdapter{}
}

func (d *darwinAdapter) PlatformName() string {
	return "darwin"
}

func (d *darwinAdapter) RequiresElevation() bool {
	return false
}

func (d *darwinAdapter) SetProxy(config ProxyConfig) error {
	service, err := getActiveNetworkService()
	if err != nil {
		return err
	}

	if config.HTTP != "" {
		cmd := exec.Command("networksetup", "-setwebproxy", service, extractHost(config.HTTP), extractPort(config.HTTP))
		if output, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("failed to set HTTP proxy: %w (%s)", err, string(output))
		}
	}

	if config.HTTPS != "" {
		cmd := exec.Command("networksetup", "-setsecurewebproxy", service, extractHost(config.HTTPS), extractPort(config.HTTPS))
		if output, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("failed to set HTTPS proxy: %w (%s)", err, string(output))
		}
	}

	if config.SOCKS5 != "" {
		cmd := exec.Command("networksetup", "-setsocksfirewallproxy", service, extractHost(config.SOCKS5), extractPort(config.SOCKS5))
		if output, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("failed to set SOCKS5 proxy: %w (%s)", err, string(output))
		}
	}

	if len(config.NoProxy) > 0 {
		cmd := exec.Command("networksetup", "-setproxybypassdomains", service, strings.Join(config.NoProxy, " "))
		if output, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("failed to set proxy bypass: %w (%s)", err, string(output))
		}
	}

	return nil
}

func (d *darwinAdapter) ClearProxy() error {
	service, err := getActiveNetworkService()
	if err != nil {
		return err
	}

	for _, cmd := range [][]string{
		{"networksetup", "-setwebproxystate", service, "off"},
		{"networksetup", "-setsecurewebproxystate", service, "off"},
		{"networksetup", "-setsocksfirewallproxystate", service, "off"},
	} {
		if output, err := exec.Command(cmd[0], cmd[1:]...).CombinedOutput(); err != nil {
			return fmt.Errorf("failed to clear proxy: %w (%s)", err, string(output))
		}
	}

	return nil
}

func (d *darwinAdapter) SetDNS(config DNSConfig) error {
	service, err := getActiveNetworkService()
	if err != nil {
		return err
	}

	args := append([]string{"-setdnsservers", service}, config.Servers...)
	cmd := exec.Command("networksetup", args...)
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to set DNS: %w (%s)", err, string(output))
	}

	if len(config.SearchDomains) > 0 {
		args = append([]string{"-setsearchdomains", service}, config.SearchDomains...)
		cmd = exec.Command("networksetup", args...)
		if output, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("failed to set search domains: %w (%s)", err, string(output))
		}
	}

	return nil
}

func (d *darwinAdapter) ClearDNS() error {
	service, err := getActiveNetworkService()
	if err != nil {
		return err
	}

	cmd := exec.Command("networksetup", "-setdnsservers", service, "Empty")
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to clear DNS: %w (%s)", err, string(output))
	}

	return nil
}

func (d *darwinAdapter) SetEnvVars(vars map[string]string) error {
	home, _ := os.UserHomeDir()
	profilePath := home + "/.zshrc"

	f, err := os.OpenFile(profilePath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("failed to open shell profile: %w", err)
	}
	defer f.Close()

	for key, value := range vars {
		line := fmt.Sprintf("export %s=\"%s\"\n", key, value)
		if _, err := f.WriteString(line); err != nil {
			return fmt.Errorf("failed to write env var %s: %w", key, err)
		}
		os.Setenv(key, value)
	}

	return nil
}

func (d *darwinAdapter) GetEnvVars(keys []string) (map[string]string, error) {
	result := make(map[string]string)
	for _, key := range keys {
		result[key] = os.Getenv(key)
	}
	return result, nil
}

func (d *darwinAdapter) FlushDNS() error {
	cmd := exec.Command("dscacheutil", "-flushcache")
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to flush DNS: %w (%s)", err, string(output))
	}

	cmd = exec.Command("sudo", "killall", "-HUP", "mDNSResponder")
	cmd.CombinedOutput()

	return nil
}

func getActiveNetworkService() (string, error) {
	cmd := exec.Command("networksetup", "-listallnetworkservices")
	output, err := cmd.Output()
	if err != nil {
		return "Wi-Fi", nil
	}

	lines := strings.Split(string(output), "\n")
	for _, line := range lines[1:] {
		line = strings.TrimSpace(line)
		if line != "" && !strings.HasPrefix(line, "*") {
			return line, nil
		}
	}

	return "Wi-Fi", nil
}

func extractHost(proxyURL string) string {
	proxyURL = strings.TrimPrefix(proxyURL, "http://")
	proxyURL = strings.TrimPrefix(proxyURL, "https://")
	proxyURL = strings.TrimPrefix(proxyURL, "socks5://")
	if idx := strings.LastIndex(proxyURL, ":"); idx != -1 {
		return proxyURL[:idx]
	}
	return proxyURL
}

func extractPort(proxyURL string) string {
	proxyURL = strings.TrimPrefix(proxyURL, "http://")
	proxyURL = strings.TrimPrefix(proxyURL, "https://")
	proxyURL = strings.TrimPrefix(proxyURL, "socks5://")
	if idx := strings.LastIndex(proxyURL, ":"); idx != -1 {
		return proxyURL[idx+1:]
	}
	return "8080"
}
