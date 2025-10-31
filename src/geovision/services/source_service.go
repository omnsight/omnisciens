package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type SourceService struct {
	pb.UnimplementedSourceServiceServer
}

func NewSourceService() *SourceService {
	return &SourceService{}
}

func (s *SourceService) GetSources(ctx context.Context, req *pb.GetSourcesRequest) (*pb.GetSourcesResponse, error) {
	return nil, errors.New("method GetSources not implemented")
}

func (s *SourceService) GetSource(ctx context.Context, req *pb.GetSourceRequest) (*pb.GetSourceResponse, error) {
	return nil, errors.New("method GetSource not implemented")
}

func (s *SourceService) GetSourceDetails(ctx context.Context, req *pb.GetSourceDetailsRequest) (*pb.GetSourceDetailsResponse, error) {
	return nil, errors.New("method GetSourceDetails not implemented")
}

func (s *SourceService) GetRelatedSources(ctx context.Context, req *pb.GetRelatedSourcesRequest) (*pb.GetRelatedSourcesResponse, error) {
	return nil, errors.New("method GetRelatedSources not implemented")
}

func (s *SourceService) CreateSource(ctx context.Context, req *pb.CreateSourceRequest) (*pb.CreateSourceResponse, error) {
	return nil, errors.New("method CreateSource not implemented")
}

func (s *SourceService) UpdateSource(ctx context.Context, req *pb.UpdateSourceRequest) (*pb.UpdateSourceResponse, error) {
	return nil, errors.New("method UpdateSource not implemented")
}

func (s *SourceService) DeleteSource(ctx context.Context, req *pb.DeleteSourceRequest) (*pb.DeleteSourceResponse, error) {
	return nil, errors.New("method DeleteSource not implemented")
}