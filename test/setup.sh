#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Deploying Omni services locally...${NC}"

# Export environment for local deployment
export ENVIRONMENT=local

# Wait for services to be healthy
echo -e "${YELLOW}Waiting for services to be healthy...${NC}"
sleep 3

# Export port mappings as environment variables
echo -e "${GREEN}Exporting service port mappings...${NC}"

# Keycloak service
if [ "$(docker ps -q -f name=omni_keycloak)" ]; then
    KEYCLOAK_HOST_PORT=$(docker port omni_keycloak 8080/tcp | cut -d ':' -f 2)
    export KEYCLOAK_URL="http://localhost:$KEYCLOAK_HOST_PORT"
    echo "KEYCLOAK_URL=$KEYCLOAK_URL"
else
    echo -e "${RED}Keycloak container not running${NC}" >&2
fi

# Omniauth service
if [ "$(docker ps -q -f name=omni_auth)" ]; then
    OMNIAUTH_HOST_PORT=$(docker port omni_auth 8080/tcp | cut -d ':' -f 2)
    export AUTH_SERVICE_URL="http://localhost:$OMNIAUTH_HOST_PORT"
    echo "AUTH_SERVICE_URL=$AUTH_SERVICE_URL"
else
    echo -e "${RED}Omniauth container not running${NC}" >&2
fi

# Omnibasement service
if [ "$(docker ps -q -f name=omni_basement)" ]; then
    OMNIBASEMENT_API_HOST_PORT=$(docker port omni_basement 8080/tcp | cut -d ':' -f 2)
    export BASEMENT_API_URL="http://localhost:$OMNIBASEMENT_API_HOST_PORT"
    echo "BASEMENT_API_URL=$BASEMENT_API_URL"
    
    OMNIBASEMENT_GRPC_HOST_PORT=$(docker port omni_basement 9090/tcp | cut -d ':' -f 2)
    export BASEMENT_GRPC_PORT="$OMNIBASEMENT_GRPC_HOST_PORT"
    echo "BASEMENT_GRPC_PORT=$BASEMENT_GRPC_PORT"
else
    echo -e "${RED}Omnibasement container not running${NC}" >&2
fi

# Geovision service
if [ "$(docker ps -q -f name=omni_geovision)" ]; then
    GEOVISION_API_HOST_PORT=$(docker port omni_geovision 8080/tcp | cut -d ':' -f 2)
    export GEOVISION_API_URL="http://localhost:$GEOVISION_API_HOST_PORT"
    echo "GEOVISION_API_URL=$GEOVISION_API_URL"
    
    GEOVISION_GRPC_HOST_PORT=$(docker port omni_geovision 9090/tcp | cut -d ':' -f 2)
    export GEOVISION_GRPC_PORT="$GEOVISION_GRPC_HOST_PORT"
    echo "GEOVISION_GRPC_PORT=$GEOVISION_GRPC_PORT"
else
    echo -e "${RED}Geovision container not running${NC}" >&2
fi

echo -e "${GREEN}Environment variables exported:${NC}"
echo "- KEYCLOAK_URL: $KEYCLOAK_URL"
echo "- AUTH_SERVICE_URL: $AUTH_SERVICE_URL"
echo "- BASEMENT_API_URL: $BASEMENT_API_URL"
echo "- BASEMENT_GRPC_PORT: $BASEMENT_GRPC_PORT"
echo "- GEOVISION_API_URL: $GEOVISION_API_URL"
echo "- GEOVISION_GRPC_PORT: $GEOVISION_GRPC_PORT"

# Setup Keycloak
echo -e "${GREEN}Setting up Keycloak...${NC}"
if npm run setup; then
  echo -e "${GREEN}✅ Local test environment is ready!${NC}"
else
  echo -e "${RED}❌ Failed to setup Keycloak. Check the error output above.${NC}" >&2
fi
