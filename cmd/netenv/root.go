package main

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var (
	verbose   bool
	dryRun    bool
	noColor   bool
	configFile string
)

var rootCmd = &cobra.Command{
	Use:   "netenv",
	Short: "Developer network environment switch tool",
	Long:  "NetEnv - A modern, cross-platform, extensible network environment switch tool for developers.",
}

func init() {
	rootCmd.PersistentFlags().BoolVarP(&verbose, "verbose", "v", false, "Enable verbose output")
	rootCmd.PersistentFlags().BoolVar(&dryRun, "dry-run", false, "Preview changes without applying")
	rootCmd.PersistentFlags().BoolVar(&noColor, "no-color", false, "Disable colored output")
	rootCmd.PersistentFlags().StringVar(&configFile, "config", "", "Config file path (default: ~/.netenv/config.yaml)")

	rootCmd.AddCommand(initCmd)
	rootCmd.AddCommand(listCmd)
	rootCmd.AddCommand(currentCmd)
	rootCmd.AddCommand(switchCmd)
	rootCmd.AddCommand(useCmd)
	rootCmd.AddCommand(validateCmd)
	rootCmd.AddCommand(rollbackCmd)
	rootCmd.AddCommand(exportCmd)
	rootCmd.AddCommand(importCmd)
	rootCmd.AddCommand(doctorCmd)
	rootCmd.AddCommand(pluginCmd)
	rootCmd.AddCommand(versionCmd)
	rootCmd.AddCommand(statusCmd)
	rootCmd.AddCommand(syncCmd)
}

func printError(msg string, args ...interface{}) {
	fmt.Fprintf(os.Stderr, "Error: "+msg+"\n", args...)
}

func printSuccess(msg string, args ...interface{}) {
	fmt.Printf("✓ "+msg+"\n", args...)
}

func printWarning(msg string, args ...interface{}) {
	fmt.Printf("⚠ "+msg+"\n", args...)
}
