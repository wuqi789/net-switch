package main

import (
	"fmt"

	"github.com/netenv/netenv/internal/plugin"
	"github.com/spf13/cobra"
)

var pluginCmd = &cobra.Command{
	Use:   "plugin",
	Short: "Manage plugins",
}

var pluginListCmd = &cobra.Command{
	Use:   "list",
	Short: "List all registered plugins",
	RunE: func(cmd *cobra.Command, args []string) error {
		reg := plugin.NewRegistry()
		plugins := reg.List()

		if len(plugins) == 0 {
			fmt.Println("No plugins registered.")
			return nil
		}

		fmt.Println("Registered plugins:")
		for _, p := range plugins {
			fmt.Printf("  • %s (v%s)\n", p.Name(), p.Version())
		}

		return nil
	},
}

func init() {
	pluginCmd.AddCommand(pluginListCmd)
}
