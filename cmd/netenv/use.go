package main

import (
	"fmt"

	"github.com/netenv/netenv/internal/config"
	"github.com/netenv/netenv/internal/engine"
	"github.com/netenv/netenv/internal/platform"
	"github.com/netenv/netenv/internal/plugin"
	"github.com/netenv/netenv/internal/state"
	"github.com/spf13/cobra"
)

var useCmd = &cobra.Command{
	Use:   "use [profile]",
	Short: "Switch to a network profile (alias for switch)",
	Args:  cobra.ExactArgs(1),
	RunE: func(cmd *cobra.Command, args []string) error {
		profileName := args[0]

		cfg, err := config.LoadConfig(configFile)
		if err != nil {
			return fmt.Errorf("failed to load config: %w", err)
		}

		profile, err := config.LoadProfile("", profileName)
		if err != nil {
			return fmt.Errorf("failed to load profile %s: %w", profileName, err)
		}

		if projectProfile, err := config.LoadProjectConfig("."); err == nil && projectProfile != nil {
			profile = config.MergeProfile(profile, projectProfile)
		}

		adapter, err := platform.NewAdapter()
		if err != nil {
			return fmt.Errorf("failed to create platform adapter: %w", err)
		}

		stateMgr := state.NewManager(config.GetStateDir(), cfg.Global.Backup.MaxHistory)
		pluginReg := plugin.NewRegistry()

		eng := engine.New(adapter, stateMgr, pluginReg, dryRun)

		result, err := eng.SwitchProfile(profile)
		if err != nil {
			return fmt.Errorf("failed to switch profile: %w", err)
		}

		if dryRun {
			fmt.Println("Dry run mode - no changes applied")
			return nil
		}

		printSuccess(result.Message)
		for _, step := range result.Steps {
			fmt.Printf("  ✓ %s: %s\n", step.Name, step.Message)
		}

		return nil
	},
}
