package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type SocialMediaService struct {
	pb.UnimplementedSocialMediaServiceServer
}

func NewSocialMediaService() *SocialMediaService {
	return &SocialMediaService{}
}

func (s *SocialMediaService) GetSocialMedias(ctx context.Context, req *pb.GetSocialMediasRequest) (*pb.GetSocialMediasResponse, error) {
	return nil, errors.New("method GetSocialMedias not implemented")
}

func (s *SocialMediaService) GetSocialMedia(ctx context.Context, req *pb.GetSocialMediaRequest) (*pb.GetSocialMediaResponse, error) {
	return nil, errors.New("method GetSocialMedia not implemented")
}

func (s *SocialMediaService) GetSocialMediaDetails(ctx context.Context, req *pb.GetSocialMediaDetailsRequest) (*pb.GetSocialMediaDetailsResponse, error) {
	return nil, errors.New("method GetSocialMediaDetails not implemented")
}

func (s *SocialMediaService) GetRelatedSocialMedias(ctx context.Context, req *pb.GetRelatedSocialMediasRequest) (*pb.GetRelatedSocialMediasResponse, error) {
	return nil, errors.New("method GetRelatedSocialMedias not implemented")
}

func (s *SocialMediaService) CreateSocialMedia(ctx context.Context, req *pb.CreateSocialMediaRequest) (*pb.CreateSocialMediaResponse, error) {
	return nil, errors.New("method CreateSocialMedia not implemented")
}

func (s *SocialMediaService) UpdateSocialMedia(ctx context.Context, req *pb.UpdateSocialMediaRequest) (*pb.UpdateSocialMediaResponse, error) {
	return nil, errors.New("method UpdateSocialMedia not implemented")
}

func (s *SocialMediaService) DeleteSocialMedia(ctx context.Context, req *pb.DeleteSocialMediaRequest) (*pb.DeleteSocialMediaResponse, error) {
	return nil, errors.New("method DeleteSocialMedia not implemented")
}