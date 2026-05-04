//go:build darwin

package platform

func NewAdapter() (PlatformAdapter, error) {
	return newDarwinAdapter(), nil
}
