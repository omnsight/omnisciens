package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type LocationService struct {
	pb.UnimplementedLocationServiceServer
}

func NewLocationService() *LocationService {
	return &LocationService{}
}

func (s *LocationService) GetLocations(ctx context.Context, req *pb.GetLocationsRequest) (*pb.GetLocationsResponse, error) {
	return nil, errors.New("method GetLocations not implemented")
}

func (s *LocationService) GetLocation(ctx context.Context, req *pb.GetLocationRequest) (*pb.GetLocationResponse, error) {
	return nil, errors.New("method GetLocation not implemented")
}

func (s *LocationService) GetLocationDetails(ctx context.Context, req *pb.GetLocationDetailsRequest) (*pb.GetLocationDetailsResponse, error) {
	return nil, errors.New("method GetLocationDetails not implemented")
}

func (s *LocationService) GetRelatedLocations(ctx context.Context, req *pb.GetRelatedLocationsRequest) (*pb.GetRelatedLocationsResponse, error) {
	return nil, errors.New("method GetRelatedLocations not implemented")
}

func (s *LocationService) CreateLocation(ctx context.Context, req *pb.CreateLocationRequest) (*pb.CreateLocationResponse, error) {
	return nil, errors.New("method CreateLocation not implemented")
}

func (s *LocationService) UpdateLocation(ctx context.Context, req *pb.UpdateLocationRequest) (*pb.UpdateLocationResponse, error) {
	return nil, errors.New("method UpdateLocation not implemented")
}

func (s *LocationService) DeleteLocation(ctx context.Context, req *pb.DeleteLocationRequest) (*pb.DeleteLocationResponse, error) {
	return nil, errors.New("method DeleteLocation not implemented")
}