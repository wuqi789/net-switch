package main

import (
	"fmt"
	"os"

	"github.com/netenv/netenv/internal/config"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

var exportCmd = &cobra.Command{
	Use:   "export [profile] [output-file]",
	Short: "Export a network profile to a file",
	Args:  cobra.RangeArgs(1, 2),
	RunE: func(cmd *cobra.Command, args []string) error {
		profileName := args[0]

		profile, err := config.LoadProfile("", profileName)
		if err != nil {
			return fmt.Errorf("failed to load profile: %w", err)
		}

		data, err := yaml.Marshal(profile)
		if err != nil {
			return fmt.Errorf("failed to marshal profile: %w", err)
		}

		if len(args) > 1 {
			if err := os.WriteFile(args[1], data, 0644); err != nil {
				return fmt.Errorf("failed to write file: %w", err)
			}
			printSuccess("Exported profile '%s' to %s", profileName, args[1])
		} else {
			fmt.Print(string(data))
		}

		return nil
	},
}
