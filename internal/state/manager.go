package state

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	"gopkg.in/yaml.v3"
)

type Manager struct {
	stateDir   string
	maxHistory int
}

func NewManager(stateDir string, maxHistory int) *Manager {
	if maxHistory <= 0 {
		maxHistory = 20
	}
	return &Manager{
		stateDir:   stateDir,
		maxHistory: maxHistory,
	}
}

func (m *Manager) SaveSnapshot(snapshot *Snapshot) error {
	if err := os.MkdirAll(m.stateDir, 0755); err != nil {
		return fmt.Errorf("failed to create state directory: %w", err)
	}

	filename := fmt.Sprintf("%s_%s.yaml", snapshot.Timestamp.Format("20060102_150405"), snapshot.ProfileName)
	filepath := filepath.Join(m.stateDir, filename)

	data, err := yaml.Marshal(snapshot)
	if err != nil {
		return fmt.Errorf("failed to marshal snapshot: %w", err)
	}

	if err := os.WriteFile(filepath, data, 0644); err != nil {
		return fmt.Errorf("failed to write snapshot: %w", err)
	}

	m.cleanup()

	return nil
}

func (m *Manager) GetLatestSnapshot() (*Snapshot, error) {
	entries, err := os.ReadDir(m.stateDir)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, fmt.Errorf("no state history found")
		}
		return nil, fmt.Errorf("failed to read state directory: %w", err)
	}

	if len(entries) == 0 {
		return nil, fmt.Errorf("no state history found")
	}

	var latest os.DirEntry
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		if latest == nil || entry.Name() > latest.Name() {
			latest = entry
		}
	}

	if latest == nil {
		return nil, fmt.Errorf("no state history found")
	}

	return m.loadSnapshot(filepath.Join(m.stateDir, latest.Name()))
}

func (m *Manager) ListSnapshots() ([]Snapshot, error) {
	entries, err := os.ReadDir(m.stateDir)
	if err != nil {
		if os.IsNotExist(err) {
			return []Snapshot{}, nil
		}
		return nil, fmt.Errorf("failed to read state directory: %w", err)
	}

	var snapshots []Snapshot
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		snapshot, err := m.loadSnapshot(filepath.Join(m.stateDir, entry.Name()))
		if err != nil {
			continue
		}
		snapshots = append(snapshots, *snapshot)
	}

	return snapshots, nil
}

func (m *Manager) loadSnapshot(path string) (*Snapshot, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read snapshot: %w", err)
	}

	snapshot := &Snapshot{}
	if err := yaml.Unmarshal(data, snapshot); err != nil {
		return nil, fmt.Errorf("failed to parse snapshot: %w", err)
	}

	return snapshot, nil
}

func (m *Manager) cleanup() {
	entries, err := os.ReadDir(m.stateDir)
	if err != nil {
		return
	}

	if len(entries) <= m.maxHistory {
		return
	}

	toRemove := entries[:len(entries)-m.maxHistory]
	for _, entry := range toRemove {
		os.Remove(filepath.Join(m.stateDir, entry.Name()))
	}
}

func NewSnapshot(profileName string) *Snapshot {
	return &Snapshot{
		Timestamp:   time.Now(),
		ProfileName: profileName,
		EnvVars:     make(map[string]string),
		Metadata:    make(map[string]interface{}),
	}
}
