package main

import (
	"context"
	"net"
	"net/http"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/reflection"

	pb "omnisciens/geovision"
	"omnisciens/geovision/services"

	gw "omnisciens/geovision"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
)

func main() {
	// ---- 1. Start the gRPC Server (your logic) ----
	grpcAddr := "localhost:9090"

	// Create a gRPC server
	gRPCServer := grpc.NewServer()

	// Register your business logic implementation with the gRPC server
	pb.RegisterEventServiceServer(gRPCServer, services.NewEventService())
	pb.RegisterPersonServiceServer(gRPCServer, services.NewPersonService())
	pb.RegisterOrganizationServiceServer(gRPCServer, services.NewOrganizationService())
	pb.RegisterLocationServiceServer(gRPCServer, services.NewLocationService())
	pb.RegisterSourceServiceServer(gRPCServer, services.NewSourceService())
	pb.RegisterWebsiteServiceServer(gRPCServer, services.NewWebsiteService())
	pb.RegisterEmailServiceServer(gRPCServer, services.NewEmailService())
	pb.RegisterPhoneServiceServer(gRPCServer, services.NewPhoneService())
	pb.RegisterIpServiceServer(gRPCServer, services.NewIpService())
	pb.RegisterSocialMediaServiceServer(gRPCServer, services.NewSocialMediaService())
	pb.RegisterRelationshipServiceServer(gRPCServer, services.NewRelationshipService())

	// Enable reflection for debugging
	reflection.Register(gRPCServer)

	// Start the gRPC server in a separate goroutine
	go func() {
		lis, _ := net.Listen("tcp", grpcAddr)
		gRPCServer.Serve(lis)
	}()

	// ---- 2. Start the gRPC-Gateway (the connection) ----
	ctx := context.Background()

	// Create a client connection to the gRPC server
	// The gateway acts as a client
	conn, _ := grpc.DialContext(
		ctx,
		grpcAddr,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
		grpc.WithBlock(),
	)

	// Create the gRPC-Gateway's multiplexer (router)
	// This mux knows how to translate HTTP routes (from proto definitions) to gRPC calls
	gwmux := runtime.NewServeMux()

	// Register all service handlers with the gateway's router
	gw.RegisterEventServiceHandler(ctx, gwmux, conn)
	gw.RegisterPersonServiceHandler(ctx, gwmux, conn)
	gw.RegisterOrganizationServiceHandler(ctx, gwmux, conn)
	gw.RegisterLocationServiceHandler(ctx, gwmux, conn)
	gw.RegisterSourceServiceHandler(ctx, gwmux, conn)
	gw.RegisterWebsiteServiceHandler(ctx, gwmux, conn)
	gw.RegisterEmailServiceHandler(ctx, gwmux, conn)
	gw.RegisterPhoneServiceHandler(ctx, gwmux, conn)
	gw.RegisterIpServiceHandler(ctx, gwmux, conn)
	gw.RegisterSocialMediaServiceHandler(ctx, gwmux, conn)
	gw.RegisterRelationshipServiceHandler(ctx, gwmux, conn)

	// ---- 3. Start the Gin Server (the HTTP entrypoint) ----
	// Create a Gin router
	r := gin.Default()

	// Tell Gin to proxy any requests on /v1/* to the gRPC-Gateway
	// THIS IS THE "CONNECTION"
	r.Any("/v1/*any", gin.WrapH(gwmux))

	// Add other Gin routes as needed
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Run the Gin server on port 8080
	r.Run(":8080")
	// Now, a request to HTTP GET :8080/v1/events/123
	// will be routed by Gin to gwmux,
	// which translates it to a gRPC call to :9090,
	// which executes your GetEvent() logic.
}