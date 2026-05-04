package version

import "fmt"

var (
	Version   = "dev"
	BuildTime = "unknown"
	GitCommit = "unknown"
)

func GetVersionInfo() string {
	return fmt.Sprintf("netenv %s (commit: %s, built: %s)", Version, GitCommit, BuildTime)
}
