#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

pushd $SCRIPT_DIR/.. > /dev/null

echo -e "${GREEN}Environment is ready. You can now run tests manually.${NC}"
echo -e "${YELLOW}To run tests, execute:${NC}"
echo "  npm test"
echo ""
echo -e "${YELLOW}Or to run a specific test:${NC}"
echo "  npm test -- src/some.test.ts"
echo ""
echo -e "${YELLOW}To stop containers when done:${NC}"
echo "  docker-compose down"

echo -e "${GREEN}Running tests...${NC}"
npm run build
npm test ${1:+"--"} "$@"

TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    echo -e "${YELLOW}Outputting container logs...${NC}"
    echo "================== Docker Container Logs =================="

    containers=("omni_keycloak" "omni_arangodb" "omni_auth" "omni_basement" "omni_geovision")
    container_names=("Keycloak" "ArangoDB" "Omniauth" "Omnibasement" "Geovision")

    for i in "${!containers[@]}"; do
        echo ""
        echo "${container_names[$i]} logs:"
        echo "-----------------------------------------------------------"
        docker logs "${containers[$i]}" 2>&1 || echo "Failed to get logs for ${containers[$i]}"
    done

    echo "=========================================================="
fi

popd > /dev/null
