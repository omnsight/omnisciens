#!/bin/bash

# Script to initialize services with required environment variables

set -e

echo "Initializing Omni services..."

# Check if running in local or cloud environment
if [ "$ENVIRONMENT" = "local" ]; then
    echo "Setting up local environment variables..."
    
    # Keycloak settings
    export KEYCLOAK_URL="http://localhost:8080"
    export KEYCLOAK_REALM="master"
    export KEYCLOAK_CLIENT_ID="admin-cli"
    export KEYCLOAK_CLIENT_SECRET="admin"
    
    # ArangoDB settings
    export ARANGO_URL="http://localhost:8529"
    export ARANGO_USERNAME="root"
    export ARANGO_PASSWORD="rootpassword"
    
elif [ "$ENVIRONMENT" = "cloud" ]; then
    echo "Setting up cloud environment variables..."
    
    # In cloud environment, these would be pulled from credential manager
    # For now, we'll use placeholder values
    export KEYCLOAK_URL="http://keycloak.internal:8080"
    export KEYCLOAK_REALM="omni"
    export KEYCLOAK_CLIENT_ID="omni-services"
    export KEYCLOAK_CLIENT_SECRET="placeholder-secret"
    
    export ARANGO_URL="http://arangodb.internal:8529"
    export ARANGO_USERNAME="omni-user"
    export ARANGO_PASSWORD="placeholder-password"
    
    # Cloud-specific settings
    export CREDENTIALS_MANAGER="aliyun-secrets-manager"
fi

# Initialize omniauth service
echo "Initializing omniauth service..."
export SERVER_PORT="9090"
export OMNIAUTH_KEYCLOAK_URL=$KEYCLOAK_URL
export OMNIAUTH_KEYCLOAK_REALM=$KEYCLOAK_REALM
export OMNIAUTH_KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID
export OMNIAUTH_KEYCLOAK_CLIENT_SECRET=$KEYCLOAK_CLIENT_SECRET

# Initialize omnibasement service
echo "Initializing omnibasement service..."
export GRPC_PORT="9091"
export SERVER_PORT="8081"
export ARANGO_DB="omni_db"
export OMNIBASEMENT_KEYCLOAK_URL=$KEYCLOAK_URL
export OMNIBASEMENT_KEYCLOAK_REALM=$KEYCLOAK_REALM
export OMNIBASEMENT_KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID
export OMNIBASEMENT_KEYCLOAK_CLIENT_SECRET=$KEYCLOAK_CLIENT_SECRET
export OMNIBASEMENT_ARANGO_URL=$ARANGO_URL
export OMNIBASEMENT_ARANGO_DB=$ARANGO_DB
export OMNIBASEMENT_ARANGO_USERNAME=$ARANGO_USERNAME
export OMNIBASEMENT_ARANGO_PASSWORD=$ARANGO_PASSWORD

# Initialize geovision service
echo "Initializing geovision service..."
export GRPC_PORT="9092"
export SERVER_PORT="8082"
export ARANGO_DB="omni_geo_db"
export GEOVISION_KEYCLOAK_URL=$KEYCLOAK_URL
export GEOVISION_KEYCLOAK_REALM=$KEYCLOAK_REALM
export GEOVISION_KEYCLOAK_CLIENT_ID=$KEYCLOAK_CLIENT_ID
export GEOVISION_KEYCLOAK_CLIENT_SECRET=$KEYCLOAK_CLIENT_SECRET
export GEOVISION_ARANGO_URL=$ARANGO_URL
export GEOVISION_ARANGO_DB=$ARANGO_DB
export GEOVISION_ARANGO_USERNAME=$ARANGO_USERNAME
export GEOVISION_ARANGO_PASSWORD=$ARANGO_PASSWORD

# Export all variables to a file that can be sourced by other scripts
ENV_FILE="/tmp/omni-env.sh"
echo "Exporting environment variables to $ENV_FILE"
cat > "$ENV_FILE" <<EOF
# Auto-generated environment variables for Omni services
export ENVIRONMENT="$ENVIRONMENT"
export KEYCLOAK_URL="$KEYCLOAK_URL"
export KEYCLOAK_REALM="$KEYCLOAK_REALM"
export KEYCLOAK_CLIENT_ID="$KEYCLOAK_CLIENT_ID"
export KEYCLOAK_CLIENT_SECRET="$KEYCLOAK_CLIENT_SECRET"
export ARANGO_URL="$ARANGO_URL"
export ARANGO_USERNAME="$ARANGO_USERNAME"
export ARANGO_PASSWORD="$ARANGO_PASSWORD"
export CREDENTIALS_MANAGER="$CREDENTIALS_MANAGER"

# Omniauth service
export SERVER_PORT="$SERVER_PORT"
export OMNIAUTH_KEYCLOAK_URL="$OMNIAUTH_KEYCLOAK_URL"
export OMNIAUTH_KEYCLOAK_REALM="$OMNIAUTH_KEYCLOAK_REALM"
export OMNIAUTH_KEYCLOAK_CLIENT_ID="$OMNIAUTH_KEYCLOAK_CLIENT_ID"
export OMNIAUTH_KEYCLOAK_CLIENT_SECRET="$OMNIAUTH_KEYCLOAK_CLIENT_SECRET"

# Omnibasement service
export OMNIBASEMENT_GRPC_PORT="9091"
export OMNIBASEMENT_SERVER_PORT="8081"
export OMNIBASEMENT_ARANGO_DB="$ARANGO_DB"
export OMNIBASEMENT_KEYCLOAK_URL="$OMNIBASEMENT_KEYCLOAK_URL"
export OMNIBASEMENT_KEYCLOAK_REALM="$OMNIBASEMENT_KEYCLOAK_REALM"
export OMNIBASEMENT_KEYCLOAK_CLIENT_ID="$OMNIBASEMENT_KEYCLOAK_CLIENT_ID"
export OMNIBASEMENT_KEYCLOAK_CLIENT_SECRET="$OMNIBASEMENT_KEYCLOAK_CLIENT_SECRET"
export OMNIBASEMENT_ARANGO_URL="$OMNIBASEMENT_ARANGO_URL"
export OMNIBASEMENT_ARANGO_DB="$OMNIBASEMENT_ARANGO_DB"
export OMNIBASEMENT_ARANGO_USERNAME="$OMNIBASEMENT_ARANGO_USERNAME"
export OMNIBASEMENT_ARANGO_PASSWORD="$OMNIBASEMENT_ARANGO_PASSWORD"

# Geovision service
export GEOVISION_GRPC_PORT="9092"
export GEOVISION_SERVER_PORT="8082"
export GEOVISION_ARANGO_DB="$ARANGO_DB"
export GEOVISION_KEYCLOAK_URL="$GEOVISION_KEYCLOAK_URL"
export GEOVISION_KEYCLOAK_REALM="$GEOVISION_KEYCLOAK_REALM"
export GEOVISION_KEYCLOAK_CLIENT_ID="$GEOVISION_KEYCLOAK_CLIENT_ID"
export GEOVISION_KEYCLOAK_CLIENT_SECRET="$GEOVISION_KEYCLOAK_CLIENT_SECRET"
export GEOVISION_ARANGO_URL="$GEOVISION_ARANGO_URL"
export GEOVISION_ARANGO_DB="$GEOVISION_ARANGO_DB"
export GEOVISION_ARANGO_USERNAME="$GEOVISION_ARANGO_USERNAME"
export GEOVISION_ARANGO_PASSWORD="$GEOVISION_ARANGO_PASSWORD"
EOF

echo "Service initialization complete."
echo "Environment variables exported to $ENV_FILE"