package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type PersonService struct {
	pb.UnimplementedPersonServiceServer
}

func NewPersonService() *PersonService {
	return &PersonService{}
}

func (s *PersonService) GetPersons(ctx context.Context, req *pb.GetPersonsRequest) (*pb.GetPersonsResponse, error) {
	return nil, errors.New("method GetPersons not implemented")
}

func (s *PersonService) GetPerson(ctx context.Context, req *pb.GetPersonRequest) (*pb.GetPersonResponse, error) {
	return nil, errors.New("method GetPerson not implemented")
}

func (s *PersonService) GetPersonDetails(ctx context.Context, req *pb.GetPersonDetailsRequest) (*pb.GetPersonDetailsResponse, error) {
	return nil, errors.New("method GetPersonDetails not implemented")
}

func (s *PersonService) GetRelatedPersons(ctx context.Context, req *pb.GetRelatedPersonsRequest) (*pb.GetRelatedPersonsResponse, error) {
	return nil, errors.New("method GetRelatedPersons not implemented")
}

func (s *PersonService) CreatePerson(ctx context.Context, req *pb.CreatePersonRequest) (*pb.CreatePersonResponse, error) {
	return nil, errors.New("method CreatePerson not implemented")
}

func (s *PersonService) UpdatePerson(ctx context.Context, req *pb.UpdatePersonRequest) (*pb.UpdatePersonResponse, error) {
	return nil, errors.New("method UpdatePerson not implemented")
}

func (s *PersonService) DeletePerson(ctx context.Context, req *pb.DeletePersonRequest) (*pb.DeletePersonResponse, error) {
	return nil, errors.New("method DeletePerson not implemented")
}