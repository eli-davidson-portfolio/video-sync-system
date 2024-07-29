#!/bin/bash

# Remove all stopped containers
docker container prune -f

# Remove all dangling images
docker image prune -f

# Remove all unused volumes
docker volume prune -f

# Remove all unused networks
docker network prune -f

# Optionally, remove all unused objects (use with caution)
# docker system prune -af --volumes

echo "Docker cleanup completed."