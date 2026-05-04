BINARY_NAME=net-switch
VERSION?=$(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
BUILD_TIME=$(shell date -u +%Y-%m-%dT%H:%M:%SZ)
GOFLAGS=-ldflags "-X github.com/netenv/netenv/pkg/version.Version=$(VERSION) -X github.com/netenv/netenv/pkg/version.BuildTime=$(BUILD_TIME)"

.PHONY: build test lint fmt clean run build-all

build:
	go build $(GOFLAGS) -o bin/$(BINARY_NAME) ./cmd/netenv/

test:
	go test -v -race -cover ./...

lint:
	golangci-lint run ./...

fmt:
	go fmt ./...
	goimports -w .

clean:
	rm -rf bin/

run:
	go run ./cmd/netenv/

build-all:
	GOOS=windows GOARCH=amd64 go build $(GOFLAGS) -o bin/$(BINARY_NAME)-windows-amd64.exe ./cmd/netenv/
	GOOS=darwin GOARCH=amd64 go build $(GOFLAGS) -o bin/$(BINARY_NAME)-darwin-amd64 ./cmd/netenv/
	GOOS=darwin GOARCH=arm64 go build $(GOFLAGS) -o bin/$(BINARY_NAME)-darwin-arm64 ./cmd/netenv/
	GOOS=linux GOARCH=amd64 go build $(GOFLAGS) -o bin/$(BINARY_NAME)-linux-amd64 ./cmd/netenv/
	GOOS=linux GOARCH=arm64 go build $(GOFLAGS) -o bin/$(BINARY_NAME)-linux-arm64 ./cmd/netenv/
