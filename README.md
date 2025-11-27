# Omnisciens

Omnisciens is an intelligent OSINT (Open Source Intelligence) platform that provides powerful data mining, analytics, and visualization capabilities.

## Project Structure

The folder structure is organized as follows:

```bash
.
├── .github/workflows/      # CI/CD workflows
├── deploy/                 # Deployment configurations and scripts
│   ├── local/              # Local testing environment (Docker Compose)
│   ├── cloud/              # Cloud deployment (Terraform for Alibaba Cloud)
│   ├── scripts/            # Deployment and management scripts
│   └── README.md           # Deployment documentation
├── src/                    # API tests using pre-generated clients
├── README.md               # This file
└── LICENSE                 # License information
```

## Services

The platform consists of the following microservices:

1. **omniauth** - User authentication and public data access
2. **omnibasement** - Core data CRUD operations with ArangoDB
3. **geovision** - Geospatial data operations

## Deployment

### Local Testing

For local testing and development:

```bash
echo | docker login ghcr.io -u bouncingmaxt --password-stdin
docker pull --platform <platform> ghcr.io/omnsight/<image>:main
docker tag ghcr.io/omnsight/<image>:main <image>:latest

docker-compose up -d --wait
source ./test/setup.sh
./test/run.sh src/auth.test.ts
docker-compose down

docker logs <container_name>

docker image prune -a
```

### Cloud Deployment

For Alibaba Cloud deployment:

```bash
cd deploy/cloud
terraform init
terraform apply
```

Or use the deployment script:

```bash
deploy/scripts/deploy-cloud.sh
```

## Key Features

1. **Multi-environment support** - Run locally for development/testing or deploy to cloud for production
2. **Cost-effective cloud deployment** - All services on a single ECS instance with RDS for Keycloak
3. **Security** - Credentials management via Alibaba Cloud Secrets Manager
4. **Data protection** - Automated backup and restore mechanisms using NAS
5. **CI/CD** - Automated testing and deployment via GitHub Actions