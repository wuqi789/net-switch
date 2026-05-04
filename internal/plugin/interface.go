package plugin

import "context"

type ExecutionContext struct {
	ProfileName string
	Config      map[string]interface{}
	DryRun      bool
}

type Plugin interface {
	Name() string
	Version() string
	Init(config map[string]interface{}) error
	Validate(ctx context.Context, profileName string) error
	Apply(ctx *ExecutionContext) error
	Rollback(ctx *ExecutionContext) error
}
