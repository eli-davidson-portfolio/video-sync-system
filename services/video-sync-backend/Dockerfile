# Build stage
FROM golang:1.19-alpine AS builder

# Install git and necessary build tools
RUN apk add --no-cache git make

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download all dependencies
RUN go mod download

# Copy the source from the current directory to the working Directory inside the container
COPY . .

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -a -installsuffix cgo -o main .

# Final stage
FROM alpine:latest

# Install ca-certificates
RUN apk --no-cache add ca-certificates

# Create a non-root user
RUN adduser -D appuser

WORKDIR /app

# Copy the pre-built binary file from the previous stage
COPY --from=builder /app/main .

# Use the non-root user
USER appuser

# Expose the port the app runs on
EXPOSE 8080

# Command to run the executable
CMD ["./main"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/health || exit 1