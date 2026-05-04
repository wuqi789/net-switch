package main

import (
	"fmt"

	"github.com/netenv/netenv/internal/config"
	"github.com/spf13/cobra"
)

var listCmd = &cobra.Command{
	Use:   "list",
	Short: "List all available network profiles",
	RunE: func(cmd *cobra.Command, args []string) error {
		profiles, err := config.ListProfiles("")
		if err != nil {
			return fmt.Errorf("failed to list profiles: %w", err)
		}

		if len(profiles) == 0 {
			fmt.Println("No profiles found. Use 'netenv init' to initialize.")
			return nil
		}

		fmt.Println("Available profiles:")
		for _, name := range profiles {
			fmt.Printf("  • %s\n", name)
		}

		return nil
	},
}
