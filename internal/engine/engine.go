package engine

import (
	"fmt"

	"github.com/netenv/netenv/internal/config"
	"github.com/netenv/netenv/internal/network"
	"github.com/netenv/netenv/internal/platform"
	"github.com/netenv/netenv/internal/plugin"
	"github.com/netenv/netenv/internal/state"
)

type Engine struct {
	adapter    platform.PlatformAdapter
	stateMgr   *state.Manager
	pluginReg  *plugin.Registry
	dryRun     bool
}

type SwitchResult struct {
	ProfileName string
	Steps       []StepResult
	Success     bool
	Message     string
}

type StepResult struct {
	Name    string
	Status  string
	Message string
}

func New(adapter platform.PlatformAdapter, stateMgr *state.Manager, pluginReg *plugin.Registry, dryRun bool) *Engine {
	return &Engine{
		adapter:   adapter,
		stateMgr:  stateMgr,
		pluginReg: pluginReg,
		dryRun:    dryRun,
	}
}

func (e *Engine) SwitchProfile(profile *config.Profile) (*SwitchResult, error) {
	result := &SwitchResult{
		ProfileName: profile.Name,
	}

	snapshot, err := e.createSnapshot(profile.Name)
	if err != nil {
		return result, fmt.Errorf("failed to create snapshot: %w", err)
	}

	if e.dryRun {
		result.Message = "Dry run: no changes applied"
		return result, nil
	}

	if err := e.applyHosts(profile); err != nil {
		e.rollback(snapshot)
		return result, fmt.Errorf("failed to apply hosts: %w", err)
	}
	result.Steps = append(result.Steps, StepResult{Name: "Hosts", Status: "ok", Message: "Applied"})

	if err := e.applyDNS(profile); err != nil {
		e.rollback(snapshot)
		return result, fmt.Errorf("failed to apply DNS: %w", err)
	}
	result.Steps = append(result.Steps, StepResult{Name: "DNS", Status: "ok", Message: "Applied"})

	if err := e.applyProxy(profile); err != nil {
		e.rollback(snapshot)
		return result, fmt.Errorf("failed to apply proxy: %w", err)
	}
	result.Steps = append(result.Steps, StepResult{Name: "Proxy", Status: "ok", Message: "Applied"})

	if err := e.applyEnvVars(profile); err != nil {
		e.rollback(snapshot)
		return result, fmt.Errorf("failed to apply env vars: %w", err)
	}
	result.Steps = append(result.Steps, StepResult{Name: "EnvVars", Status: "ok", Message: "Applied"})

	if err := e.stateMgr.SaveSnapshot(snapshot); err != nil {
		return result, fmt.Errorf("failed to save snapshot: %w", err)
	}

	result.Success = true
	result.Message = fmt.Sprintf("Successfully switched to profile %s", profile.Name)

	return result, nil
}

func (e *Engine) Rollback() error {
	snapshot, err := e.stateMgr.GetLatestSnapshot()
	if err != nil {
		return fmt.Errorf("failed to get latest snapshot: %w", err)
	}

	if snapshot.Proxy != nil {
		e.adapter.ClearProxy()
	}

	if snapshot.DNS != nil {
		e.adapter.ClearDNS()
	}

	e.adapter.FlushDNS()

	return nil
}

func (e *Engine) createSnapshot(profileName string) (*state.Snapshot, error) {
	snapshot := state.NewSnapshot(profileName)
	return snapshot, nil
}

func (e *Engine) rollback(snapshot *state.Snapshot) {
	e.adapter.ClearProxy()
	e.adapter.ClearDNS()
	e.adapter.FlushDNS()
}

func (e *Engine) applyHosts(profile *config.Profile) error {
	if !profile.Hosts.Enabled {
		return nil
	}

	hostsMgr := network.NewHostsManager("")
	var entries []network.HostsEntry
	for _, entry := range profile.Hosts.Entries {
		entries = append(entries, network.HostsEntry{
			IP:       entry.IP,
			Hostname: entry.Hostname,
			Comment:  entry.Comment,
		})
	}

	return hostsMgr.ApplyEntries(profile.Name, entries)
}

func (e *Engine) applyDNS(profile *config.Profile) error {
	if !profile.DNS.Enabled {
		return nil
	}

	return e.adapter.SetDNS(platform.DNSConfig{
		Servers:       profile.DNS.Servers,
		SearchDomains: profile.DNS.SearchDomains,
	})
}

func (e *Engine) applyProxy(profile *config.Profile) error {
	if !profile.Proxy.Enabled {
		return nil
	}

	return e.adapter.SetProxy(platform.ProxyConfig{
		HTTP:    profile.Proxy.HTTP,
		HTTPS:   profile.Proxy.HTTPS,
		SOCKS5:  profile.Proxy.SOCKS5,
		PAC:     profile.Proxy.PAC,
		NoProxy: profile.Proxy.NoProxy,
	})
}

func (e *Engine) applyEnvVars(profile *config.Profile) error {
	if !profile.EnvVars.Enabled {
		return nil
	}

	envMgr := network.NewEnvVarManager()
	expanded := envMgr.ExpandVariables(profile.EnvVars.Variables)

	return e.adapter.SetEnvVars(expanded)
}
