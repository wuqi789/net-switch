//go:build windows

package platform

func NewAdapter() (PlatformAdapter, error) {
	return newWindowsAdapter(), nil
}
