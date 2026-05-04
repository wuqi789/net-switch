package main

import (
	"fmt"

	"github.com/netenv/netenv/internal/config"
	"github.com/spf13/cobra"
)

var validateCmd = &cobra.Command{
	Use:   "validate [profile]",
	Short: "Validate a network profile configuration",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		profileName := args[0]

		profile, err := config.LoadProfile("", profileName)
		if err != nil {
			return fmt.Errorf("failed to load profile: %w", err)
		}

		errs := config.Validate(profile)
		if len(errs) > 0 {
			fmt.Printf("Profile '%s' has %d validation error(s):\n", profileName, len(errs))
			for _, err := range errs {
				fmt.Printf("  ✗ %v\n", err)
			}
			return fmt.Errorf("validation failed")
		}

		printSuccess("Profile '%s' is valid", profileName)
		return nil
	},
}
