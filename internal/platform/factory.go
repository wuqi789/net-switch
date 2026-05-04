package platform

import (
	"fmt"
	"runtime"
)

func NewAdapter() (PlatformAdapter, error) {
	switch runtime.GOOS {
	case "windows":
		return newWindowsAdapter(), nil
	case "darwin":
		return newDarwinAdapter(), nil
	case "linux":
		return newLinuxAdapter(), nil
	default:
		return nil, fmt.Errorf("unsupported platform: %s", runtime.GOOS)
	}
}
