#!/bin/bash

# === Set project root path here ===
PROJECT_ROOT="/Users/madhub/NewSoftwares/taskManagementApp/taskManagement_Backend"

# List of service directories relative to project root
services=("eureka_Registry" "api-gateway" "user-service" "task-service" "notification-service" "comment-service" "project-service" "teamService")

# Function to get server.port from application.yml or application.properties
get_port() {
    local service_dir=$1
    local port=""

    # Check YAML
    if [ -f "$service_dir/src/main/resources/application.yml" ]; then
        port=$(grep -E "^\s*port\s*:" "$service_dir/src/main/resources/application.yml" | head -n1 | awk '{print $2}' | tr -d ' ')
    fi

    # Check properties (override YAML if present)
    if [ -f "$service_dir/src/main/resources/application.properties" ]; then
        port_prop=$(grep -E "^server\.port" "$service_dir/src/main/resources/application.properties" | cut -d '=' -f2 | tr -d ' ')
        if [ ! -z "$port_prop" ]; then
            port=$port_prop
        fi
    fi

    # Default port
    echo "${port:-8080}"
}

# Function to run a service and wait until it's UP
run_service() {
    local service=$1
    local service_path="$PROJECT_ROOT/$service"
    echo "🚀 Starting $service..."

    # Check if service directory exists
    if [ ! -d "$service_path" ]; then
        echo "❌ Directory $service_path not found, skipping..."
        return
    fi

    # Build the service
    cd "$service_path" || exit 1
    echo "🔨 Building $service..."
    mvn clean install

    # Get port
    port=$(get_port "$service_path")
    echo "📌 Detected port: $port"

    # # Start service in background and log output
    # log_file="$PROJECT_ROOT/${service}_log.txt"
    # mvn spring-boot:run > "$log_file" 2>&1 &
    # pid=$!
    # echo "📄 Logs: $log_file"

    # Wait for Actuator health endpoint
    # echo "⏳ Waiting for $service to become UP..."
    # until curl -s http://localhost:$port/actuator/health | grep -q "UP"; do
    #     printf '.'
    #     sleep 2
    # done
    # echo "✅ $service is UP!"

    # Return to project root
    cd "$PROJECT_ROOT" || exit 1
}

# Loop through all services sequentially
for service in "${services[@]}"; do
    run_service "$service"
done

echo "🎉 All services are running!"
