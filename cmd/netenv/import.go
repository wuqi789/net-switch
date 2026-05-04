package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/netenv/netenv/internal/config"
	"github.com/spf13/cobra"
	"gopkg.in/yaml.v3"
)

var importCmd = &cobra.Command{
	Use:   "import [file]",
	Short: "Import a network profile from a file",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		filePath := args[0]

		data, err := os.ReadFile(filePath)
		if err != nil {
			return fmt.Errorf("failed to read file: %w", err)
		}

		profile := config.DefaultProfile()
		if err := yaml.Unmarshal(data, profile); err != nil {
			return fmt.Errorf("failed to parse profile: %w", err)
		}

		if profile.Name == "" {
			profile.Name = filepath.Base(filePath)
			profile.Name = profile.Name[:len(profile.Name)-len(filepath.Ext(profile.Name))]
		}

		if err := config.SaveProfile("", profile); err != nil {
			return fmt.Errorf("failed to save profile: %w", err)
		}

		printSuccess("Imported profile '%s'", profile.Name)
		return nil
	},
}
