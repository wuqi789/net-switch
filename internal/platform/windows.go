//go:build windows

package platform

import (
	"fmt"
	"os"
	"os/exec"
	"strings"

	"golang.org/x/sys/windows/registry"
)

type windowsAdapter struct{}

func newWindowsAdapter() *windowsAdapter {
	return &windowsAdapter{}
}

func (w *windowsAdapter) PlatformName() string {
	return "windows"
}

func (w *windowsAdapter) RequiresElevation() bool {
	return false
}

func (w *windowsAdapter) SetProxy(config ProxyConfig) error {
	key, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Internet Settings`, registry.SET_VALUE)
	if err != nil {
		return fmt.Errorf("failed to open registry key: %w", err)
	}
	defer key.Close()

	if config.PAC != "" {
		if err := key.SetStringValue("AutoConfigURL", config.PAC); err != nil {
			return fmt.Errorf("failed to set PAC: %w", err)
		}
		if err := key.SetDWordValue("ProxyEnable", 0); err != nil {
			return fmt.Errorf("failed to disable manual proxy: %w", err)
		}
		return nil
	}

	proxyServer := buildProxyServer(config)
	if proxyServer != "" {
		if err := key.SetStringValue("ProxyOverride", strings.Join(config.NoProxy, ";")); err != nil {
			return fmt.Errorf("failed to set proxy override: %w", err)
		}
		if err := key.SetStringValue("ProxyServer", proxyServer); err != nil {
			return fmt.Errorf("failed to set proxy server: %w", err)
		}
		if err := key.SetDWordValue("ProxyEnable", 1); err != nil {
			return fmt.Errorf("failed to enable proxy: %w", err)
		}
	}

	return nil
}

func (w *windowsAdapter) ClearProxy() error {
	key, err := registry.OpenKey(registry.CURRENT_USER, `Software\Microsoft\Windows\CurrentVersion\Internet Settings`, registry.SET_VALUE)
	if err != nil {
		return fmt.Errorf("failed to open registry key: %w", err)
	}
	defer key.Close()

	if err := key.SetDWordValue("ProxyEnable", 0); err != nil {
		return fmt.Errorf("failed to disable proxy: %w", err)
	}

	key.DeleteValue("AutoConfigURL")

	return nil
}

func (w *windowsAdapter) SetDNS(config DNSConfig) error {
	iface, err := getDefaultInterface()
	if err != nil {
		return fmt.Errorf("failed to get default interface: %w", err)
	}

	for i, server := range config.Servers {
		var cmd *exec.Cmd
		if i == 0 {
			cmd = exec.Command("netsh", "interface", "ip", "set", "dns", iface, "static", server, "primary")
		} else {
			cmd = exec.Command("netsh", "interface", "ip", "add", "dns", iface, server, fmt.Sprintf("index=%d", i+1))
		}
		if output, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("failed to set DNS server %s: %w (%s)", server, err, string(output))
		}
	}

	return nil
}

func (w *windowsAdapter) ClearDNS() error {
	iface, err := getDefaultInterface()
	if err != nil {
		return fmt.Errorf("failed to get default interface: %w", err)
	}

	cmd := exec.Command("netsh", "interface", "ip", "set", "dns", iface, "dhcp")
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to clear DNS: %w (%s)", err, string(output))
	}

	return nil
}

func (w *windowsAdapter) SetEnvVars(vars map[string]string) error {
	for key, value := range vars {
		if err := os.Setenv(key, value); err != nil {
			return fmt.Errorf("failed to set env var %s: %w", key, err)
		}

		cmd := exec.Command("setx", key, value)
		if output, err := cmd.CombinedOutput(); err != nil {
			return fmt.Errorf("failed to persist env var %s: %w (%s)", key, err, string(output))
		}
	}
	return nil
}

func (w *windowsAdapter) GetEnvVars(keys []string) (map[string]string, error) {
	result := make(map[string]string)
	for _, key := range keys {
		result[key] = os.Getenv(key)
	}
	return result, nil
}

func (w *windowsAdapter) FlushDNS() error {
	cmd := exec.Command("ipconfig", "/flushdns")
	if output, err := cmd.CombinedOutput(); err != nil {
		return fmt.Errorf("failed to flush DNS: %w (%s)", err, string(output))
	}
	return nil
}

func buildProxyServer(config ProxyConfig) string {
	var parts []string
	if config.HTTP != "" {
		parts = append(parts, "http="+config.HTTP)
	}
	if config.HTTPS != "" {
		parts = append(parts, "https="+config.HTTPS)
	}
	if config.SOCKS5 != "" {
		parts = append(parts, "socks="+config.SOCKS5)
	}
	return strings.Join(parts, ";")
}

func getDefaultInterface() (string, error) {
	cmd := exec.Command("powershell", "-Command", "(Get-NetRoute -DestinationPrefix '0.0.0.0/0' | Sort-Object -Property RouteMetric | Select-Object -First 1).InterfaceAlias")
	output, err := cmd.Output()
	if err != nil {
		return "Ethernet", nil
	}
	iface := strings.TrimSpace(string(output))
	if iface == "" {
		return "Ethernet", nil
	}
	return iface, nil
}
