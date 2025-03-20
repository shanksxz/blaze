#!/usr/bin/env bash
# Use this script to start a docker container for a local development database
# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`
# On Linux and macOS you can run this script directly - `./start-database.sh`

DB_NAME="blaze" 
DB_CONTAINER_NAME="blaze-postgres"
DB_VOLUME_NAME="blaze-postgres-data"

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not running. Please start Docker and try again."
  exit 1
fi

if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
  if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
    echo "Database container '$DB_CONTAINER_NAME' already running"
    exit 0
  else
    docker start "$DB_CONTAINER_NAME"
    echo "Existing database container '$DB_CONTAINER_NAME' started"
    exit 0
  fi
fi

set -a
source .env

DB_PASSWORD=$(echo "$DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
DB_PORT=$(echo "$DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')

if [ "$DB_PASSWORD" = "password" ]; then
  echo "You are using the default database password"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please change the default password in the .env file and try again"
    exit 1
  fi
  DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
  sed -i -e "s#:password@#:$DB_PASSWORD@#" .env
fi

if ! docker volume inspect "$DB_VOLUME_NAME" >/dev/null 2>&1; then
  docker volume create "$DB_VOLUME_NAME"
  echo "Created database volume '$DB_VOLUME_NAME'"
fi

docker run -d \
  --name $DB_CONTAINER_NAME \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB=$DB_NAME \
  -p "$DB_PORT":5432 \
  -v "$DB_VOLUME_NAME":/var/lib/postgresql/data \
  docker.io/postgres && echo "Database container '$DB_CONTAINER_NAME' was successfully created with persistent volume '$DB_VOLUME_NAME'" 