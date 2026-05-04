package main

import (
	"fmt"

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
			fmt.Println("No active profile. Use 'netenv switch <profile>' to activate one.")
			return nil
		}

		fmt.Printf("Active profile: %s\n", cfg.Global.DefaultProfile)
		return nil
	},
}
