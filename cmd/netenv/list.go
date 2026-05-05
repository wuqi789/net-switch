package main

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/netenv/netenv/internal/config"
	"github.com/spf13/cobra"
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List all available network profiles",
	RunE: func(cmd *cobra.Command, args []string) error {
		profileNames, err := config.ListProfiles("")
		if err != nil {
			return fmt.Errorf("failed to list profiles: %w", err)
		}

		if len(profileNames) == 0 {
			if outputFmt == "json" {
				fmt.Println("[]")
				return nil
			}
			fmt.Println("No profiles found. Use 'netenv init' to initialize.")
			return nil
		}

		if outputFmt == "json" {
			var profiles []map[string]interface{}
			for _, name := range profileNames {
				p, err := config.LoadProfile("", name)
				if err != nil {
					continue
				}
				noProxy := ""
				if len(p.Proxy.NoProxy) > 0 {
					noProxy = strings.Join(p.Proxy.NoProxy, ",")
				}
				profiles = append(profiles, map[string]interface{}{
					"name":        name,
					"description": p.Description,
					"http_proxy":  p.Proxy.HTTP,
					"https_proxy": p.Proxy.HTTPS,
					"no_proxy":    noProxy,
					"has_dns":     p.DNS.Enabled,
					"hosts_count": len(p.Hosts.Entries),
				})
			}
			if profiles == nil {
				fmt.Println("[]")
				return nil
			}
			output, _ := json.Marshal(profiles)
			fmt.Println(string(output))
			return nil
		}

		fmt.Println("Available profiles:")
		for _, name := range profileNames {
			fmt.Printf("  • %s\n", name)
		}

		return nil
	},
}
