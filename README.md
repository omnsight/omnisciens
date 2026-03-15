# Nexus Intelligence Platform

## Services & DBs

1. 3 Microservices:
    * [omni-osint-crud](https://github.com/omnsight/omni-osint-crud) has its [Open API Json file](https://github.com/omnsight/omni-osint-crud/blob/main/doc/openapi.json) and image in [GHCR](ghcr.io/omnsight/omni-osint-crud:latest)
    * [omni-osint-query](https://github.com/omnsight/omni-osint-query) has its [Open API Json file](https://github.com/omnsight/omni-osint-query/blob/main/doc/openapi.json) and image in [GHCR](ghcr.io/omnsight/omni-osint-query:latest)
    * [omni-monitoring](https://github.com/omnsight/omni-monitoring) has its [Open API Json file](https://github.com/omnsight/omni-monitoring/blob/main/doc/openapi.json) and image in [GHCR](ghcr.io/omnsight/omni-monitoring:latest)
2. 1 Redis
3. 1 ArangoDB with persistence enabled - one 50GB EBS volume (can be extended in future)

All microservices and DBs are deployed in one EC2 instance backed by an ASG (for future scaling).

## Load Balancer & Gateway

1. API Gateway set up from OPEN API Json files combined
2. ALB that connects API Gateway and microservices

## Other Resources

1. Cognito user pool and its integration with API Gateway for fully managed authentication. The final OPEN API definition should pass auth header through API gateway to backend microservices.
2. VPC
3. Secrets Manager to store DB credentials generated at deployment time
