package main

import (
	"fmt"

	"github.com/netenv/netenv/internal/config"
	"github.com/netenv/netenv/internal/platform"
	"github.com/netenv/netenv/internal/state"
	"github.com/spf13/cobra"
)

var rollbackCmd = &cobra.Command{
	Use:   "rollback",
	Short: "Rollback to the previous network configuration",
	RunE: func(cmd *cobra.Command, args []string) error {
		stateMgr := state.NewManager(config.GetStateDir(), 20)

		snapshot, err := stateMgr.GetLatestSnapshot()
		if err != nil {
			return fmt.Errorf("no state to rollback to: %w", err)
		}

		adapter, err := platform.NewAdapter()
		if err != nil {
			return fmt.Errorf("failed to create platform adapter: %w", err)
		}

		if snapshot.Proxy != nil {
			adapter.ClearProxy()
		}
		if snapshot.DNS != nil {
			adapter.ClearDNS()
		}
		adapter.FlushDNS()

		printSuccess("Rolled back to previous state (from profile: %s)", snapshot.ProfileName)
		return nil
	},
}
