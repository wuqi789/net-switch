package main

import (
	"fmt"

	"github.com/netenv/netenv/internal/network"
	"github.com/spf13/cobra"
)

var doctorCmd = &cobra.Command{
	Use:   "doctor",
	Short: "Diagnose current network environment status",
	RunE: func(cmd *cobra.Command, args []string) error {
		checker := network.NewHealthChecker()

		config := &network.HealthConfig{}
		report := checker.RunAllChecks(config)

		fmt.Println("Network Environment Health Check")
		fmt.Println("=================================")

		for _, result := range report.Results {
			var icon string
			switch result.Status {
			case "ok":
				icon = "✓"
			case "warning":
				icon = "⚠"
			case "error":
				icon = "✗"
			default:
				icon = "○"
			}
			fmt.Printf("  %s %s: %s\n", icon, result.Name, result.Message)
		}

		fmt.Printf("\nResults: %d passed, %d failed\n", report.Passed, report.Failed)

		if report.Failed > 0 {
			return fmt.Errorf("health check failed")
		}

		return nil
	},
}
