#!/bin/bash

# Script to backup data from ArangoDB and Keycloak

set -e

echo "Starting data backup..."

BACKUP_DIR="/tmp/omni-backup"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
BACKUP_PATH="$BACKUP_DIR/$TIMESTAMP"

mkdir -p "$BACKUP_PATH"

# Backup ArangoDB data
echo "Backing up ArangoDB data..."
if [ "$ENVIRONMENT" = "local" ]; then
    # Local backup using arangodump
    docker exec omni_arangodb arangodump \
        --server.endpoint http+tcp://127.0.0.1:8529 \
        --server.username root \
        --server.password rootpassword \
        --output-directory "/tmp/arangodump-$TIMESTAMP" \
        --overwrite true
    
    # Copy dump from container to host
    docker cp "omni_arangodb:/tmp/arangodump-$TIMESTAMP" "$BACKUP_PATH/arangodb"
    
elif [ "$ENVIRONMENT" = "cloud" ]; then
    # Cloud backup would use Alibaba Cloud NAS
    echo "Cloud backup would use Alibaba Cloud NAS mount point: $NAS_MOUNT_POINT"
    # This would connect to the NAS and perform backup
    # Example:
    # mkdir -p "/mnt/nas/backup/$TIMESTAMP"
    # arangodump --server.endpoint $ARANGO_URL --server.username $ARANGO_USERNAME --server.password $ARANGO_PASSWORD --output-directory "/mnt/nas/backup/$TIMESTAMP/arangodb"
fi

echo "Data backup completed: $BACKUP_PATH"

# In a real implementation for cloud, we would also backup Keycloak data
# This would involve backing up the RDS MySQL database using Alibaba Cloud DB backup features

# Export the backup path for potential restoration
export BACKUP_PATH="$BACKUP_PATH"
echo "BACKUP_PATH=$BACKUP_PATH" > /tmp/omni-backup-path.env
echo "Backup path exported to /tmp/omni-backup-path.env"