package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type IpService struct {
	pb.UnimplementedIpServiceServer
}

func NewIpService() *IpService {
	return &IpService{}
}

func (s *IpService) GetIps(ctx context.Context, req *pb.GetIpsRequest) (*pb.GetIpsResponse, error) {
	return nil, errors.New("method GetIps not implemented")
}

func (s *IpService) GetIp(ctx context.Context, req *pb.GetIpRequest) (*pb.GetIpResponse, error) {
	return nil, errors.New("method GetIp not implemented")
}

func (s *IpService) GetIpDetails(ctx context.Context, req *pb.GetIpDetailsRequest) (*pb.GetIpDetailsResponse, error) {
	return nil, errors.New("method GetIpDetails not implemented")
}

func (s *IpService) GetRelatedIps(ctx context.Context, req *pb.GetRelatedIpsRequest) (*pb.GetRelatedIpsResponse, error) {
	return nil, errors.New("method GetRelatedIps not implemented")
}

func (s *IpService) CreateIp(ctx context.Context, req *pb.CreateIpRequest) (*pb.CreateIpResponse, error) {
	return nil, errors.New("method CreateIp not implemented")
}

func (s *IpService) UpdateIp(ctx context.Context, req *pb.UpdateIpRequest) (*pb.UpdateIpResponse, error) {
	return nil, errors.New("method UpdateIp not implemented")
}

func (s *IpService) DeleteIp(ctx context.Context, req *pb.DeleteIpRequest) (*pb.DeleteIpResponse, error) {
	return nil, errors.New("method DeleteIp not implemented")
}