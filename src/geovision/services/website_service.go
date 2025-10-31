package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type WebsiteService struct {
	pb.UnimplementedWebsiteServiceServer
}

func NewWebsiteService() *WebsiteService {
	return &WebsiteService{}
}

func (s *WebsiteService) GetWebsites(ctx context.Context, req *pb.GetWebsitesRequest) (*pb.GetWebsitesResponse, error) {
	return nil, errors.New("method GetWebsites not implemented")
}

func (s *WebsiteService) GetWebsite(ctx context.Context, req *pb.GetWebsiteRequest) (*pb.GetWebsiteResponse, error) {
	return nil, errors.New("method GetWebsite not implemented")
}

func (s *WebsiteService) GetWebsiteDetails(ctx context.Context, req *pb.GetWebsiteDetailsRequest) (*pb.GetWebsiteDetailsResponse, error) {
	return nil, errors.New("method GetWebsiteDetails not implemented")
}

func (s *WebsiteService) GetRelatedWebsites(ctx context.Context, req *pb.GetRelatedWebsitesRequest) (*pb.GetRelatedWebsitesResponse, error) {
	return nil, errors.New("method GetRelatedWebsites not implemented")
}

func (s *WebsiteService) CreateWebsite(ctx context.Context, req *pb.CreateWebsiteRequest) (*pb.CreateWebsiteResponse, error) {
	return nil, errors.New("method CreateWebsite not implemented")
}

func (s *WebsiteService) UpdateWebsite(ctx context.Context, req *pb.UpdateWebsiteRequest) (*pb.UpdateWebsiteResponse, error) {
	return nil, errors.New("method UpdateWebsite not implemented")
}

func (s *WebsiteService) DeleteWebsite(ctx context.Context, req *pb.DeleteWebsiteRequest) (*pb.DeleteWebsiteResponse, error) {
	return nil, errors.New("method DeleteWebsite not implemented")
}