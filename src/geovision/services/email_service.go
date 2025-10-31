package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type EmailService struct {
	pb.UnimplementedEmailServiceServer
}

func NewEmailService() *EmailService {
	return &EmailService{}
}

func (s *EmailService) GetEmails(ctx context.Context, req *pb.GetEmailsRequest) (*pb.GetEmailsResponse, error) {
	return nil, errors.New("method GetEmails not implemented")
}

func (s *EmailService) GetEmail(ctx context.Context, req *pb.GetEmailRequest) (*pb.GetEmailResponse, error) {
	return nil, errors.New("method GetEmail not implemented")
}

func (s *EmailService) GetEmailDetails(ctx context.Context, req *pb.GetEmailDetailsRequest) (*pb.GetEmailDetailsResponse, error) {
	return nil, errors.New("method GetEmailDetails not implemented")
}

func (s *EmailService) GetRelatedEmails(ctx context.Context, req *pb.GetRelatedEmailsRequest) (*pb.GetRelatedEmailsResponse, error) {
	return nil, errors.New("method GetRelatedEmails not implemented")
}

func (s *EmailService) CreateEmail(ctx context.Context, req *pb.CreateEmailRequest) (*pb.CreateEmailResponse, error) {
	return nil, errors.New("method CreateEmail not implemented")
}

func (s *EmailService) UpdateEmail(ctx context.Context, req *pb.UpdateEmailRequest) (*pb.UpdateEmailResponse, error) {
	return nil, errors.New("method UpdateEmail not implemented")
}

func (s *EmailService) DeleteEmail(ctx context.Context, req *pb.DeleteEmailRequest) (*pb.DeleteEmailResponse, error) {
	return nil, errors.New("method DeleteEmail not implemented")
}