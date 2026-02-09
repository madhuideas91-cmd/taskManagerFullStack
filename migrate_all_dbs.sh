#!/bin/bash

# Local MySQL credentials
LOCAL_USER="root"
LOCAL_PASS="password"

# Docker MySQL container name
DOCKER_MYSQL_CONTAINER="mysql"
DOCKER_MYSQL_PASS="password"

# List of databases (exact names from your local MySQL)
DBS=(
"user_ServiceDB"
"task_serviceDB"
"project_ServiceDB"
"comment_service_db"
"team_service_db"
"notification_servicedb"
)

# Loop over each DB
for DB in "${DBS[@]}"; do
  echo "=== Migrating $DB ==="
  
  # Dump local DB
  mysqldump -u $LOCAL_USER -p$LOCAL_PASS $DB > ${DB}.sql
  
  # Copy to Docker container
  docker cp ${DB}.sql $DOCKER_MYSQL_CONTAINER:/${DB}.sql
  
  # Import into Docker MySQL
  docker exec -i $DOCKER_MYSQL_CONTAINER mysql -u root -p$DOCKER_MYSQL_PASS -e "CREATE DATABASE IF NOT EXISTS $DB; USE $DB; SOURCE /${DB}.sql;"
  
  echo "$DB migrated ✅"
done

echo "🎉 All databases migrated successfully!"

