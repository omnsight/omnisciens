#!/bin/bash

# Script to clean up deployed services and data

set -e

echo "Cleaning up Omni services..."

# Check environment
if [ -z "$ENVIRONMENT" ]; then
    echo "ENVIRONMENT not set. Assuming 'local' environment."
    ENVIRONMENT="local"
fi

if [ "$ENVIRONMENT" = "local" ]; then
    echo "Cleaning up local environment..."
    
    # Stop docker-compose services
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    cd "$SCRIPT_DIR/../local"
    
    if docker-compose ps | grep -q "omni"; then
        echo "Stopping Docker Compose services..."
        docker-compose down
    else
        echo "No running Docker Compose services found."
    fi
    
    # Clean up environment file
    if [ -f "/tmp/omni-env.sh" ]; then
        echo "Removing environment file..."
        rm -f /tmp/omni-env.sh
    fi
    
    # Clean up backup files
    if [ -d "/tmp/omni-backup" ]; then
        echo "Removing backup files..."
        rm -rf /tmp/omni-backup
    fi
    
    echo "Local environment cleanup complete."
    
elif [ "$ENVIRONMENT" = "cloud" ]; then
    echo "Cleaning up cloud environment..."
    echo "Note: This will destroy all cloud resources."
    echo "Please use 'terraform destroy' in the cloud directory if you really want to do this."
fi

echo "Cleanup process completed."