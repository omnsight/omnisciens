package services

import (
	"context"
	"errors"

	pb "omnisciens/geovision"
)

type EventService struct {
	pb.UnimplementedEventServiceServer
}

func NewEventService() *EventService {
	return &EventService{}
}

func (s *EventService) GetEvents(ctx context.Context, req *pb.GetEventsRequest) (*pb.GetEventsResponse, error) {
	return nil, errors.New("method GetEvents not implemented")
}

func (s *EventService) GetEvent(ctx context.Context, req *pb.GetEventRequest) (*pb.GetEventResponse, error) {
	return nil, errors.New("method GetEvent not implemented")
}

func (s *EventService) GetEventDetails(ctx context.Context, req *pb.GetEventDetailsRequest) (*pb.GetEventDetailsResponse, error) {
	return nil, errors.New("method GetEventDetails not implemented")
}

func (s *EventService) GetRelatedEvents(ctx context.Context, req *pb.GetRelatedEventsRequest) (*pb.GetRelatedEventsResponse, error) {
	return nil, errors.New("method GetRelatedEvents not implemented")
}

func (s *EventService) CreateEvent(ctx context.Context, req *pb.CreateEventRequest) (*pb.CreateEventResponse, error) {
	return nil, errors.New("method CreateEvent not implemented")
}

func (s *EventService) UpdateEvent(ctx context.Context, req *pb.UpdateEventRequest) (*pb.UpdateEventResponse, error) {
	return nil, errors.New("method UpdateEvent not implemented")
}

func (s *EventService) DeleteEvent(ctx context.Context, req *pb.DeleteEventRequest) (*pb.DeleteEventResponse, error) {
	return nil, errors.New("method DeleteEvent not implemented")
}