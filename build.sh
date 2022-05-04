#!/bin/sh
# Run as root (if docker needs root)

GREEN='\033[0;32m'
NC='\033[0m'

clean_up()
{
    echo -e "${GREEN}-> Cleaning up${NC}"
    rm -rf build-node_modules
    rm -rf dist-cli

    echo -e "${GREEN}-> Done${NC}"
}

if [ "$1" = "--docker-shell" ]; then
    docker run --rm -ti --pull=always --env ELECTRON_CACHE="/root/.cache/electron" --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" -v ${PWD}:/project -v ${PWD}/build-node_modules:/project/node_modules -v ~/.cache/electron:/root/.cache/electron -v ~/.cache/electron-builder:/root/.cache/electron-builder electronuserland/builder:wine
    clean_up
    exit 0
fi

# Clean dist
echo -e "${GREEN}-> Cleaning dist${NC}"
rm -rf dist

# Build cli executables
echo -e "${GREEN}-> Building cli executables${NC}"
yarn
yarn pkg-l
yarn pkg-w
#yarn pkg-m

# Build electron with cli executables
# macOS fails to build for me in docker (with dmg and pkg)
echo -e "${GREEN}-> Building packages${NC}"
docker run --rm -ti --pull=always --env ELECTRON_CACHE="/root/.cache/electron" --env ELECTRON_BUILDER_CACHE="/root/.cache/electron-builder" -v ${PWD}:/project -v ${PWD}/build-node_modules:/project/node_modules -v ~/.cache/electron:/root/.cache/electron -v ~/.cache/electron-builder:/root/.cache/electron-builder electronuserland/builder:wine bash -c "yarn && yarn dist-l && yarn dist-w"

# Clean up
clean_up
