package plugin

import "fmt"

type Registry struct {
	plugins map[string]Plugin
}

func NewRegistry() *Registry {
	return &Registry{
		plugins: make(map[string]Plugin),
	}
}

func (r *Registry) Register(p Plugin) error {
	name := p.Name()
	if _, exists := r.plugins[name]; exists {
		return fmt.Errorf("plugin %s is already registered", name)
	}
	r.plugins[name] = p
	return nil
}

func (r *Registry) Get(name string) (Plugin, bool) {
	p, ok := r.plugins[name]
	return p, ok
}

func (r *Registry) List() []Plugin {
	var plugins []Plugin
	for _, p := range r.plugins {
		plugins = append(plugins, p)
	}
	return plugins
}

func (r *Registry) InitAll(configs map[string]map[string]interface{}) error {
	for name, p := range r.plugins {
		cfg := configs[name]
		if cfg == nil {
			cfg = make(map[string]interface{})
		}
		if err := p.Init(cfg); err != nil {
			return fmt.Errorf("failed to initialize plugin %s: %w", name, err)
		}
	}
	return nil
}
