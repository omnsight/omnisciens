package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type RelationshipService struct {
	pb.UnimplementedRelationshipServiceServer
}

func NewRelationshipService() *RelationshipService {
	return &RelationshipService{}
}

func (s *RelationshipService) GetRelationships(ctx context.Context, req *pb.GetRelationshipsRequest) (*pb.GetRelationshipsResponse, error) {
	return nil, errors.New("method GetRelationships not implemented")
}

func (s *RelationshipService) GetRelationship(ctx context.Context, req *pb.GetRelationshipRequest) (*pb.GetRelationshipResponse, error) {
	return nil, errors.New("method GetRelationship not implemented")
}

func (s *RelationshipService) GetRelationshipDetails(ctx context.Context, req *pb.GetRelationshipDetailsRequest) (*pb.GetRelationshipDetailsResponse, error) {
	return nil, errors.New("method GetRelationshipDetails not implemented")
}

func (s *RelationshipService) GetRelatedRelationships(ctx context.Context, req *pb.GetRelatedRelationshipsRequest) (*pb.GetRelatedRelationshipsResponse, error) {
	return nil, errors.New("method GetRelatedRelationships not implemented")
}

func (s *RelationshipService) CreateRelationship(ctx context.Context, req *pb.CreateRelationshipRequest) (*pb.CreateRelationshipResponse, error) {
	return nil, errors.New("method CreateRelationship not implemented")
}

func (s *RelationshipService) UpdateRelationship(ctx context.Context, req *pb.UpdateRelationshipRequest) (*pb.UpdateRelationshipResponse, error) {
	return nil, errors.New("method UpdateRelationship not implemented")
}

func (s *RelationshipService) DeleteRelationship(ctx context.Context, req *pb.DeleteRelationshipRequest) (*pb.DeleteRelationshipResponse, error) {
	return nil, errors.New("method DeleteRelationship not implemented")
}