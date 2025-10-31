# Overview

GeoVision is a sub-product of [Omnisciens](../../README.md). It includes a frontend web page and backend API.  It is centered around a live map displaying geospecial data in a certain time range, often recent few days. GeoVision focuses on OSINT events and connections among them. However, other OSINT data entities are queries and shown in the details of an event. Currently supported OSINT entities include event, source, person, organization, location, website, email, phone, ip, and social media.

## How the UI looks like

The most of the UI is a live world map showing points representing events and connections between them representing relationships. The left bar starts with the website Icon and a list of selectable icons for different kind of analytical products. The top bar starts with a search bard and advanced search button. Followed by it, a time range selector is displayed to allow querying OSINT data in a certain period. Then to the top right, there is a login button and common setting dropdown containing common website settings.

When advanced button is clicked, an advanced filter window is shown on the top left just under the top bar. When a specific OSINT data point on the map is clicked, a floating window is shown in the center of the screen displaying detailed event data.

When admin user logs in, they see a list of small icons around bottom right of the screen. These icons give admin user multiple options to perform admin tasks.

## Requirements

Users can:
1. Query OSINT events by time range showing as point on the live map. Relationships between events are shown as lines. Different types of OSINT events correspond to different icons.
1. Click on an event point to see detailed information about the event.
1. Click on the referenced OSINT data entity in the event detail window to see detailed information about the entity.

Admin user can:
1. Edit/add/delete any fields of any OSINT data entity in the detailed windows. The detailed window should contain additional distinct input means for adding non-event OSINT data entities connected to the event. Here the admin user needs to fill the details for the relation between the event and new entity. The relation name can be entered by the admin user with a dropdown hint showing existing relation names if the admin user wishs to use an existing relation name.
1. Mark an OSINT data entity as visible/invisible to other users.
1. Add an OSINT event when in the add mode by clicking the right icon on the bottom right corner. In the center just under the top bar, a location search bar is shown for adding a new event. Then a window is shown to allow admin user to fill in the event detail.
1. In add mode, click an existing OSINT data entity to link it against another OSINT data entity. A window is shown to fill details for the new relationship.

## Out of Scope

All the functionalities described only in [here](#how-the-ui-looks-like) that are not listed in [requirements](#requirements) are out of scope. Simply mock the UI components.

## Service HTTP APIs

Based on the requirements, the following HTTP APIs will be exposed:

### Event APIs
- GET /events?start_time=&end_time= -> Events[]
- GET /events/{event_id} -> Event
- GET /events/{event_id}/details -> {sources: Source[], persons: Person[], organizations: Organization[], locations: Location[], websites: Website[], emails: Email[], phones: Phone[], ips: Ip[], social_medias: SocialMedia[]}
- GET /events/{event_id}/related-events -> Events[]
- GET /events/{event_id}/sources -> Sources[]
- GET /events/{event_id}/persons -> Persons[]
- GET /events/{event_id}/organizations -> Organizations[]
- GET /events/{event_id}/locations -> Locations[]
- GET /events/{event_id}/websites -> Websites[]
- GET /events/{event_id}/emails -> Emails[]
- GET /events/{event_id}/phones -> Phones[]
- GET /events/{event_id}/ips -> Ips[]
- GET /events/{event_id}/social-medias -> SocialMedias[]
- POST /events (create_event) -> Event
- PUT /events/{event_id} (update_event) -> Event
- DELETE /events/{event_id} -> SuccessStatus

### OSINT Entity APIs
Each entity type (source, person, organization, location, website, email, phone, ip, social media) should only support basic CRUD operations: GET with id, PUT, POST, and DELETE.

### Relationship APIs
- GET /events/{event_id}/relationships -> Relationships[]
- POST /relationships (create_relationship) -> Relationship
- PUT /relationships/{relationship_id} (update_relationship) -> Relationship
- DELETE /relationships/{relationship_id} -> SuccessStatus

### Admin APIs
- PUT /entities/{entity_type}/{entity_id}/visibility (set_visibility) -> success_status

## Development Guide

The project structure is already outlined in [here](../README.md). Note that the IDL files should generate code in the corresponding frontend and backend folders. Let's use gRPC as the IDL language and gRPC-Gateway to generate Gin compatible HTTP handlers. Use gRPC-Gateway to generate OpenAPI for react side typescript client generation for simpler development. The OSINT data model in gRPC should contain ArangoDB native data fields that are useful. Use go json tag to map normalized field names to ArangoDB field names such as `json:"_id"`.
