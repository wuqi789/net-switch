package main

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/netenv/netenv/internal/config"
	"github.com/spf13/cobra"
)

var currentCmd = &cobra.Command{
	Use:   "current",
	Short: "Show the currently active network profile",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := config.LoadConfig("")
		if err != nil {
			return fmt.Errorf("failed to load config: %w", err)
		}

		if cfg.Global.DefaultProfile == "" {
			if outputFmt == "json" {
				fmt.Println(`{"current_profile":"","description":"","http_proxy":"","https_proxy":"","no_proxy":"","dns":null,"hosts":[]}`)
				return nil
			}
			fmt.Println("No active profile. Use 'netenv switch <profile>' to activate one.")
			return nil
		}

		profileName := cfg.Global.DefaultProfile

		if outputFmt == "json" {
			p, err := config.LoadProfile("", profileName)
			if err != nil {
				p = config.DefaultProfile()
			}

			noProxy := ""
			if len(p.Proxy.NoProxy) > 0 {
				noProxy = strings.Join(p.Proxy.NoProxy, ",")
			}

			var dnsInfo interface{}
			if p.DNS.Enabled {
				dnsInfo = map[string]interface{}{"servers": p.DNS.Servers}
			}

			var hosts []map[string]string
			for _, h := range p.Hosts.Entries {
				hosts = append(hosts, map[string]string{"ip": h.IP, "hostname": h.Hostname})
			}

			result := map[string]interface{}{
				"current_profile": profileName,
				"description":     p.Description,
				"http_proxy":      p.Proxy.HTTP,
				"https_proxy":     p.Proxy.HTTPS,
				"no_proxy":        noProxy,
				"dns":             dnsInfo,
				"hosts":           hosts,
			}

			output, _ := json.Marshal(result)
			fmt.Println(string(output))
			return nil
		}

		fmt.Printf("Active profile: %s\n", profileName)
		return nil
	},
}
