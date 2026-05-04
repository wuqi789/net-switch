//go:build linux

package platform

func NewAdapter() (PlatformAdapter, error) {
	return newLinuxAdapter(), nil
}
