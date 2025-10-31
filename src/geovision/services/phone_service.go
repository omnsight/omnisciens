package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type PhoneService struct {
	pb.UnimplementedPhoneServiceServer
}

func NewPhoneService() *PhoneService {
	return &PhoneService{}
}

func (s *PhoneService) GetPhones(ctx context.Context, req *pb.GetPhonesRequest) (*pb.GetPhonesResponse, error) {
	return nil, errors.New("method GetPhones not implemented")
}

func (s *PhoneService) GetPhone(ctx context.Context, req *pb.GetPhoneRequest) (*pb.GetPhoneResponse, error) {
	return nil, errors.New("method GetPhone not implemented")
}

func (s *PhoneService) GetPhoneDetails(ctx context.Context, req *pb.GetPhoneDetailsRequest) (*pb.GetPhoneDetailsResponse, error) {
	return nil, errors.New("method GetPhoneDetails not implemented")
}

func (s *PhoneService) GetRelatedPhones(ctx context.Context, req *pb.GetRelatedPhonesRequest) (*pb.GetRelatedPhonesResponse, error) {
	return nil, errors.New("method GetRelatedPhones not implemented")
}

func (s *PhoneService) CreatePhone(ctx context.Context, req *pb.CreatePhoneRequest) (*pb.CreatePhoneResponse, error) {
	return nil, errors.New("method CreatePhone not implemented")
}

func (s *PhoneService) UpdatePhone(ctx context.Context, req *pb.UpdatePhoneRequest) (*pb.UpdatePhoneResponse, error) {
	return nil, errors.New("method UpdatePhone not implemented")
}

func (s *PhoneService) DeletePhone(ctx context.Context, req *pb.DeletePhoneRequest) (*pb.DeletePhoneResponse, error) {
	return nil, errors.New("method DeletePhone not implemented")
}