package main

import (
	"log"
	"os"
	"os/signal"
	"server/db"
	"server/internal/user"
	"server/internal/ws"
	"server/router"
	"syscall"
)

func main() {

	gracefulStop := make(chan os.Signal)
	signal.Notify(gracefulStop, syscall.SIGINT, syscall.SIGTERM)

	dbConn, err := db.NewDatabase()
	if err != nil {
		log.Fatalf("could not initialize database connection: %s", err)
	}

	userRep := user.NewRepository(dbConn.GetDB())
	userSvc := user.NewService(userRep)
	userHandler := user.NewHandler(userSvc)

	hub := ws.NewHub()
	wsHandler := ws.NewHandler(hub)
	go hub.Run()

	router.InitRouter(userHandler, wsHandler)
	var serverAddr = "0.0.0.0:8080"

	go func() {
		log.Printf("Server listening on %s", serverAddr)
		router.Start(serverAddr)
	}()

	<-gracefulStop

	log.Println("Shutting down server gracefully...")
	// Perform cleanup tasks if needed

	log.Println("Server gracefully stopped.")
}
