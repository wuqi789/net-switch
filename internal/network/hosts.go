package network

import (
	"bufio"
	"fmt"
	"os"
	"runtime"
	"strings"
	"sync"
)

type HostsEntry struct {
	IP       string
	Hostname string
	Comment  string
}

type HostsManager struct {
	hostsPath string
	mu        sync.Mutex
}

func NewHostsManager(hostsPath string) *HostsManager {
	if hostsPath == "" {
		if runtime.GOOS == "windows" {
			hostsPath = `C:\Windows\System32\drivers\etc\hosts`
		} else {
			hostsPath = "/etc/hosts"
		}
	}
	return &HostsManager{hostsPath: hostsPath}
}

func (h *HostsManager) ApplyEntries(profileName string, entries []HostsEntry) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	lines, err := h.readHosts()
	if err != nil {
		return err
	}

	lines = h.removeBlock(lines, profileName)

	var block []string
	block = append(block, fmt.Sprintf("# netenv:begin:%s", profileName))
	for _, entry := range entries {
		line := fmt.Sprintf("%s\t%s", entry.IP, entry.Hostname)
		if entry.Comment != "" {
			line += fmt.Sprintf(" # %s", entry.Comment)
		}
		block = append(block, line)
	}
	block = append(block, fmt.Sprintf("# netenv:end:%s", profileName))

	lines = append(lines, block...)

	return h.writeHosts(lines)
}

func (h *HostsManager) RemoveEntries(profileName string) error {
	h.mu.Lock()
	defer h.mu.Unlock()

	lines, err := h.readHosts()
	if err != nil {
		return err
	}

	lines = h.removeBlock(lines, profileName)

	return h.writeHosts(lines)
}

func (h *HostsManager) GetEntries(profileName string) ([]HostsEntry, error) {
	h.mu.Lock()
	defer h.mu.Unlock()

	lines, err := h.readHosts()
	if err != nil {
		return nil, err
	}

	var entries []HostsEntry
	inBlock := false
	beginMarker := fmt.Sprintf("# netenv:begin:%s", profileName)
	endMarker := fmt.Sprintf("# netenv:end:%s", profileName)

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == beginMarker {
			inBlock = true
			continue
		}
		if trimmed == endMarker {
			inBlock = false
			continue
		}
		if inBlock && !strings.HasPrefix(trimmed, "#") && trimmed != "" {
			entry := parseHostsLine(trimmed)
			if entry != nil {
				entries = append(entries, *entry)
			}
		}
	}

	return entries, nil
}

func (h *HostsManager) readHosts() ([]string, error) {
	f, err := os.Open(h.hostsPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open hosts file: %w", err)
	}
	defer f.Close()

	var lines []string
	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		lines = append(lines, scanner.Text())
	}

	return lines, scanner.Err()
}

func (h *HostsManager) writeHosts(lines []string) error {
	content := strings.Join(lines, "\n") + "\n"
	return os.WriteFile(h.hostsPath, []byte(content), 0644)
}

func (h *HostsManager) removeBlock(lines []string, profileName string) []string {
	beginMarker := fmt.Sprintf("# netenv:begin:%s", profileName)
	endMarker := fmt.Sprintf("# netenv:end:%s", profileName)

	var result []string
	inBlock := false

	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed == beginMarker {
			inBlock = true
			continue
		}
		if trimmed == endMarker {
			inBlock = false
			continue
		}
		if !inBlock {
			result = append(result, line)
		}
	}

	return result
}

func parseHostsLine(line string) *HostsEntry {
	line = strings.TrimSpace(line)
	if line == "" || strings.HasPrefix(line, "#") {
		return nil
	}

	comment := ""
	if idx := strings.Index(line, "#"); idx != -1 {
		comment = strings.TrimSpace(line[idx+1:])
		line = strings.TrimSpace(line[:idx])
	}

	fields := strings.Fields(line)
	if len(fields) < 2 {
		return nil
	}

	return &HostsEntry{
		IP:       fields[0],
		Hostname: fields[1],
		Comment:  comment,
	}
}
