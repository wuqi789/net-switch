package errors

import "fmt"

type ErrorCode int

const (
	ErrCodeConfig     ErrorCode = 1
	ErrCodePlatform   ErrorCode = 2
	ErrCodeNetwork    ErrorCode = 3
	ErrCodePermission ErrorCode = 4
	ErrCodePlugin     ErrorCode = 5
)

type AppError struct {
	Code       ErrorCode
	Message    string
	Suggestion string
	Err        error
}

func (e *AppError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("[%d] %s: %v", e.Code, e.Message, e.Err)
	}
	return fmt.Sprintf("[%d] %s", e.Code, e.Message)
}

func (e *AppError) Unwrap() error {
	return e.Err
}

func NewConfigError(msg, suggestion string, err error) *AppError {
	return &AppError{Code: ErrCodeConfig, Message: msg, Suggestion: suggestion, Err: err}
}

func NewPlatformError(msg, suggestion string, err error) *AppError {
	return &AppError{Code: ErrCodePlatform, Message: msg, Suggestion: suggestion, Err: err}
}

func NewNetworkError(msg, suggestion string, err error) *AppError {
	return &AppError{Code: ErrCodeNetwork, Message: msg, Suggestion: suggestion, Err: err}
}

func NewPermissionError(msg, suggestion string, err error) *AppError {
	return &AppError{Code: ErrCodePermission, Message: msg, Suggestion: suggestion, Err: err}
}

func NewPluginError(msg, suggestion string, err error) *AppError {
	return &AppError{Code: ErrCodePlugin, Message: msg, Suggestion: suggestion, Err: err}
}

func IsAppError(err error) (*AppError, bool) {
	if err == nil {
		return nil, false
	}
	if ae, ok := err.(*AppError); ok {
		return ae, true
	}
	return nil, false
}
