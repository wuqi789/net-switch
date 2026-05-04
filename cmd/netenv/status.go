package main

import (
	"encoding/json"
	"fmt"
	"os"
	"runtime"

	"github.com/netenv/netenv/internal/config"
	"github.com/spf13/cobra"
)

var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Show current system status as JSON",
	RunE: func(cmd *cobra.Command, args []string) error {
		cfg, err := config.LoadConfig(configFile)
		if err != nil {
			return fmt.Errorf("failed to load config: %w", err)
		}

		currentProfile := cfg.Global.DefaultProfile

		proxyStatus := map[string]string{
			"http_proxy":  os.Getenv("HTTP_PROXY"),
			"https_proxy": os.Getenv("HTTPS_PROXY"),
			"no_proxy":    os.Getenv("NO_PROXY"),
		}

		if proxyStatus["http_proxy"] == "" {
			proxyStatus["http_proxy"] = os.Getenv("http_proxy")
		}
		if proxyStatus["https_proxy"] == "" {
			proxyStatus["https_proxy"] = os.Getenv("https_proxy")
		}
		if proxyStatus["no_proxy"] == "" {
			proxyStatus["no_proxy"] = os.Getenv("no_proxy")
		}

		type backupInfo struct {
			Count  int    `json:"count"`
			Latest string `json:"latest"`
		}

		result := map[string]interface{}{
			"current_profile": currentProfile,
			"platform":        runtime.GOOS,
			"proxy":           proxyStatus,
			"dns":             map[string]interface{}{"servers": []string{}},
			"hosts":           map[string]interface{}{},
			"backup":          backupInfo{Count: 0, Latest: ""},
		}

		output, err := json.Marshal(result)
		if err != nil {
			return fmt.Errorf("failed to marshal status: %w", err)
		}

		fmt.Println(string(output))
		return nil
	},
}
