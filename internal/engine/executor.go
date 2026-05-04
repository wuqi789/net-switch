package engine

import "fmt"

type StepFunc func() error

type Executor struct {
	steps []Step
}

type Step struct {
	Name string
	Fn   StepFunc
}

func NewExecutor() *Executor {
	return &Executor{}
}

func (e *Executor) AddStep(name string, fn StepFunc) {
	e.steps = append(e.steps, Step{Name: name, Fn: fn})
}

func (e *Executor) Run() ([]StepResult, error) {
	var results []StepResult

	for _, step := range e.steps {
		if err := step.Fn(); err != nil {
			results = append(results, StepResult{
				Name:    step.Name,
				Status:  "error",
				Message: err.Error(),
			})
			return results, fmt.Errorf("step %s failed: %w", step.Name, err)
		}

		results = append(results, StepResult{
			Name:    step.Name,
			Status:  "ok",
			Message: "Completed",
		})
	}

	return results, nil
}
