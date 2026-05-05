package main

import (
	"fmt"

	"github.com/spf13/cobra"
)

var currentCmd = &cobra.Command{
	Use:   "current",
	Short: "Show the currently active network profile",
	RunE: func(cmd *cobra.Command, args []string) error {
		if outputFmt == "json" {
			fmt.Println(`{"current_profile":"","description":"","http_proxy":"","https_proxy":"","no_proxy":"","dns":null,"hosts":[]}`)
			return nil
		}

		fmt.Println("No active profile. Use 'netenv switch <profile>' to activate one.")
		return nil
	},
}
