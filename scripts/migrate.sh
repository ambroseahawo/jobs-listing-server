#!/bin/bash

# Migration script for microservices
# Usage: ./scripts/migrate.sh [auth|users|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Prisma Migrations...${NC}"

# Function to run migrations for a service
run_migrations() {
    local service=$1
    local service_path="./apps/$service"
    
    echo -e "${YELLOW}📦 Running migrations for $service service...${NC}"
    
    if [ ! -d "$service_path/prisma" ]; then
        echo -e "${RED}❌ Prisma directory not found for $service${NC}"
        return 1
    fi
    
    cd "$service_path"
    
    # Generate Prisma client
    echo -e "${YELLOW}🔧 Generating Prisma client for $service...${NC}"
    npx prisma generate
    
    # Run migrations
    echo -e "${YELLOW}🔄 Running migrations for $service...${NC}"
    npx prisma migrate deploy
    
    # Optional: Seed the database
    if [ -f "prisma/seed.ts" ]; then
        echo -e "${YELLOW}🌱 Seeding database for $service...${NC}"
        npx ts-node prisma/seed.ts
    fi
    
    cd - > /dev/null
    echo -e "${GREEN}✅ Migrations completed for $service${NC}"
}

# Function to create initial migration
create_initial_migration() {
    local service=$1
    local service_path="./apps/$service"
    
    echo -e "${YELLOW}📝 Creating initial migration for $service...${NC}"
    
    cd "$service_path"
    
    # Create initial migration
    npx prisma migrate dev --name init
    
    cd - > /dev/null
    echo -e "${GREEN}✅ Initial migration created for $service${NC}"
}

# Main script logic
case "${1:-all}" in
    "auth")
        run_migrations "auth"
        ;;
    "users")
        run_migrations "users"
        ;;
    "all")
        run_migrations "auth"
        run_migrations "users"
        ;;
    "init-auth")
        create_initial_migration "auth"
        ;;
    "init-users")
        create_initial_migration "users"
        ;;
    "init-all")
        create_initial_migration "auth"
        create_initial_migration "users"
        ;;
    *)
        echo -e "${RED}❌ Invalid option. Usage:${NC}"
        echo "  ./scripts/migrate.sh [auth|users|all|init-auth|init-users|init-all]"
        echo ""
        echo "Options:"
        echo "  auth        - Run migrations for auth service only"
        echo "  users       - Run migrations for users service only"
        echo "  all         - Run migrations for all services (default)"
        echo "  init-auth   - Create initial migration for auth service"
        echo "  init-users  - Create initial migration for users service"
        echo "  init-all    - Create initial migrations for all services"
        exit 1
        ;;
esac

echo -e "${GREEN}🎉 All migrations completed successfully!${NC}" 