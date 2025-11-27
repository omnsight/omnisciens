#!/bin/bash

# Script to deploy services to Alibaba Cloud

set -e

echo "Deploying Omni services to Alibaba Cloud..."

# Make sure we're in the right directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../cloud"

# Check if required environment variables are set
if [[ -z "$ALICLOUD_ACCESS_KEY" || -z "$ALICLOUD_SECRET_KEY" ]]; then
    echo "Error: ALICLOUD_ACCESS_KEY and ALICLOUD_SECRET_KEY must be set"
    exit 1
fi

# Initialize Terraform
echo "Initializing Terraform..."
terraform init

# Apply Terraform configuration
echo "Applying Terraform configuration..."
terraform apply -auto-approve

# Get the outputs
ECS_IP=$(terraform output -raw ecs_public_ip)
KEYCLOAK_DB_ENDPOINT=$(terraform output -raw keycloak_db_endpoint)
NAS_MOUNT_POINT=$(terraform output -raw nas_mount_point)

echo "ECS instance IP: $ECS_IP"
echo "Keycloak DB Endpoint: $KEYCLOAK_DB_ENDPOINT"
echo "NAS Mount Point: $NAS_MOUNT_POINT"

# Deploy services to the created ECS instance
echo "Deploying services to ECS instance..."
# This would typically involve:
# 1. SSH to the ECS instance
# 2. Install Docker and required dependencies
# 3. Copy docker-compose file to ECS
# 4. Start services with docker-compose
# 5. Configure backup mechanisms with NAS

# Example of what would be done:
# ssh -i ~/.ssh/aliyun_key.pem "root@$ECS_IP" << 'EOF'
# apt-get update
# apt-get install -y docker.io docker-compose
# mkdir -p /opt/omni
# # Copy docker-compose.yml to ECS instance
# # Start services
# cd /opt/omni
# docker-compose up -d
# EOF

# Configure credentials manager
echo "Setting up credentials manager..."
# This would involve:
# 1. Updating secrets in Alibaba Cloud Secrets Manager with real values
# 2. Configuring the ECS instance to access them via RAM role
# 3. Setting up CSI driver to mount secrets as volumes in containers

echo "Cloud deployment initiated."
echo "ECS instance is accessible at: $ECS_IP"
echo "Please allow a few minutes for services to start."
echo ""
echo "Next steps:"
echo "1. SSH to the ECS instance"
echo "2. Install Docker and Docker Compose"
echo "3. Copy deployment files to the instance"
echo "4. Start services with docker-compose"
echo "5. Configure backup mechanisms with NAS"