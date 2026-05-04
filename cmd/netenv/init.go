package main

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/netenv/netenv/internal/config"
	"github.com/spf13/cobra"
)

var initCmd = &cobra.Command{
	Use:   "init",
	Short: "Initialize netenv configuration directory and files",
	RunE: func(cmd *cobra.Command, args []string) error {
		netenvDir := config.GetNetenvDir()

		dirs := []string{
			netenvDir,
			filepath.Join(netenvDir, "profiles"),
			filepath.Join(netenvDir, "state"),
			filepath.Join(netenvDir, "plugins"),
		}

		for _, dir := range dirs {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return fmt.Errorf("failed to create directory %s: %w", dir, err)
			}
		}

		configPath := config.GetConfigFilePath()
		if _, err := os.Stat(configPath); os.IsNotExist(err) {
			gc := config.DefaultGlobalConfig()
			if err := config.SaveGlobalConfig(configPath, gc); err != nil {
				return fmt.Errorf("failed to save default config: %w", err)
			}
		}

		printSuccess("Initialized netenv directory at %s", netenvDir)
		fmt.Println("\nDirectory structure:")
		fmt.Printf("  %s/\n", netenvDir)
		fmt.Println("  ├── config.yaml")
		fmt.Println("  ├── profiles/")
		fmt.Println("  ├── state/")
		fmt.Println("  └── plugins/")
		fmt.Println("\nNext steps:")
		fmt.Println("  1. Create a profile: netenv switch <profile-name>")
		fmt.Println("  2. List profiles: netenv list")
		fmt.Println("  3. Check status: netenv current")

		return nil
	},
}
