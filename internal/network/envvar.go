package network

import (
	"os"
	"regexp"
)

type EnvVarManager struct{}

func NewEnvVarManager() *EnvVarManager {
	return &EnvVarManager{}
}

func (e *EnvVarManager) ExpandVariables(vars map[string]string) map[string]string {
	result := make(map[string]string, len(vars))
	re := regexp.MustCompile(`\$\{([^}]+)\}`)

	for key, value := range vars {
		expanded := re.ReplaceAllStringFunc(value, func(match string) string {
			varName := match[2 : len(match)-1]
			if envVal, exists := os.LookupEnv(varName); exists {
				return envVal
			}
			return match
		})
		result[key] = expanded
	}

	return result
}

func (e *EnvVarManager) SetEnvVar(key, value string) error {
	return os.Setenv(key, value)
}

func (e *EnvVarManager) GetEnvVar(key string) string {
	return os.Getenv(key)
}
