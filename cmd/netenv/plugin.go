package main

import (
	"encoding/json"
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
			if outputFmt == "json" {
				fmt.Println("[]")
				return nil
			}
			fmt.Println("No plugins registered.")
			return nil
		}

		if outputFmt == "json" {
			var list []map[string]interface{}
			for _, p := range plugins {
				list = append(list, map[string]interface{}{
					"name":        p.Name(),
					"version":     p.Version(),
					"author":      "",
					"description": "",
					"enabled":     true,
					"permissions": []string{},
					"commands":    []string{},
				})
			}
			output, _ := json.Marshal(list)
			fmt.Println(string(output))
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
