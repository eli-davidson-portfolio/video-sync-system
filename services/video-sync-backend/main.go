package main

import (
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/go-kit/kit/log"
)

func main() {
	logger := log.NewLogfmtLogger(os.Stderr)
	logger = log.With(logger, "ts", log.DefaultTimestampUTC)
	logger = log.With(logger, "caller", log.DefaultCaller)

	var svc VideoSyncService
	svc = videoSyncService{}
	svc = loggingMiddleware{logger, svc}

	httpHandler := makeHTTPHandler(svc, logger)

	errs := make(chan error)
	go func() {
		c := make(chan os.Signal, 1)
		signal.Notify(c, syscall.SIGINT, syscall.SIGTERM)
		errs <- fmt.Errorf("%s", <-c)
	}()

	go func() {
		logger.Log("transport", "HTTP", "addr", ":8080")
		errs <- http.ListenAndServe(":8080", httpHandler)
	}()

	logger.Log("exit", <-errs)
}

type VideoSyncService interface {
	Sync(clientTime int64) (int64, error)
}

type videoSyncService struct{}

func (videoSyncService) Sync(clientTime int64) (int64, error) {
	// TODO: Implement synchronization logic
	return clientTime, nil
}

type loggingMiddleware struct {
	logger log.Logger
	next   VideoSyncService
}

func (mw loggingMiddleware) Sync(clientTime int64) (serverTime int64, err error) {
	defer func() {
		mw.logger.Log("method", "Sync", "clientTime", clientTime, "serverTime", serverTime, "err", err)
	}()
	return mw.next.Sync(clientTime)
}

func makeHTTPHandler(svc VideoSyncService, logger log.Logger) http.Handler {
	// TODO: Implement HTTP handler
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("Hello, World!"))
	})
}