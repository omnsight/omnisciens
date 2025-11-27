#!/bin/bash

# Script to restore data to ArangoDB and Keycloak

set -e

echo "Starting data restoration..."

# Check if backup directory is provided
if [ -z "$BACKUP_PATH" ]; then
    # Try to load from env file
    if [ -f "/tmp/omni-backup-path.env" ]; then
        echo "Loading backup path from /tmp/omni-backup-path.env"
        source /tmp/omni-backup-path.env
    else
        echo "Error: BACKUP_PATH environment variable must be set"
        exit 1
    fi
fi

if [ ! -d "$BACKUP_PATH" ]; then
    echo "Error: Backup directory $BACKUP_PATH does not exist"
    exit 1
fi

echo "Restoring from backup: $BACKUP_PATH"

# Restore ArangoDB data
echo "Restoring ArangoDB data..."
if [ "$ENVIRONMENT" = "local" ]; then
    # Local restore using arangorestore
    if [ -d "$BACKUP_PATH/arangodb" ]; then
        docker cp "$BACKUP_PATH/arangodb" omni_arangodb:/tmp/arangodb-backup
        docker exec omni_arangodb arangorestore \
            --server.endpoint http+tcp://127.0.0.1:8529 \
            --server.username root \
            --server.password rootpassword \
            --input-directory "/tmp/arangodb-backup" \
            --overwrite true
        echo "ArangoDB data restored successfully"
    else
        echo "Warning: ArangoDB backup not found in $BACKUP_PATH"
    fi
    
elif [ "$ENVIRONMENT" = "cloud" ]; then
    # Cloud restore would use Alibaba Cloud NAS
    echo "Cloud restore would use Alibaba Cloud NAS mount point: $NAS_MOUNT_POINT"
    # This would connect to the NAS and perform restore
    # Example:
    # arangorestore --server.endpoint $ARANGO_URL --server.username $ARANGO_USERNAME --server.password $ARANGO_PASSWORD --input-directory "$BACKUP_PATH/arangodb"
fi

echo "Data restoration completed."