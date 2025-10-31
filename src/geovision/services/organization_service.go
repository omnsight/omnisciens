package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type OrganizationService struct {
	pb.UnimplementedOrganizationServiceServer
}

func NewOrganizationService() *OrganizationService {
	return &OrganizationService{}
}

func (s *OrganizationService) GetOrganizations(ctx context.Context, req *pb.GetOrganizationsRequest) (*pb.GetOrganizationsResponse, error) {
	return nil, errors.New("method GetOrganizations not implemented")
}

func (s *OrganizationService) GetOrganization(ctx context.Context, req *pb.GetOrganizationRequest) (*pb.GetOrganizationResponse, error) {
	return nil, errors.New("method GetOrganization not implemented")
}

func (s *OrganizationService) GetOrganizationDetails(ctx context.Context, req *pb.GetOrganizationDetailsRequest) (*pb.GetOrganizationDetailsResponse, error) {
	return nil, errors.New("method GetOrganizationDetails not implemented")
}

func (s *OrganizationService) GetRelatedOrganizations(ctx context.Context, req *pb.GetRelatedOrganizationsRequest) (*pb.GetRelatedOrganizationsResponse, error) {
	return nil, errors.New("method GetRelatedOrganizations not implemented")
}

func (s *OrganizationService) CreateOrganization(ctx context.Context, req *pb.CreateOrganizationRequest) (*pb.CreateOrganizationResponse, error) {
	return nil, errors.New("method CreateOrganization not implemented")
}

func (s *OrganizationService) UpdateOrganization(ctx context.Context, req *pb.UpdateOrganizationRequest) (*pb.UpdateOrganizationResponse, error) {
	return nil, errors.New("method UpdateOrganization not implemented")
}

func (s *OrganizationService) DeleteOrganization(ctx context.Context, req *pb.DeleteOrganizationRequest) (*pb.DeleteOrganizationResponse, error) {
	return nil, errors.New("method DeleteOrganization not implemented")
}