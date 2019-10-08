#!/bin/bash

set -eo pipefail

# Install the database
echo "Installing MySQL"
mysql_install_db

# Start the MySQL daemon in the background.
echo "Starting MySQL daemon"
mysqld --user=root &
mysql_pid=$!

echo "Waiting for database to come up"
until mysqladmin ping >/dev/null 2>&1; do
  echo -n "."; sleep 0.2
done

echo "Removing MySQL default users"
mysql --protocol=socket -h localhost -u root -e "DELETE FROM mysql.user WHERE user=''"
echo "Creating shabados MySQL user"
mysql --protocol=socket -h localhost -u root -e "CREATE USER 'shabados'@'%'"
echo "Creating shabad-os database"
mysql --protocol=socket -h localhost -u root -e "CREATE DATABASE \`shabados\`"
echo "Granting priviledges to shabados database"
mysql --protocol=socket -h localhost -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'shabados'@'%'"
mysql --protocol=socket -h localhost -u root -e "FLUSH PRIVILEGES"

# Populate the database with data
echo "Populating data"
npm run build-mysql

# Tell the MySQL daemon to shutdown.
echo "Shutting down MySQL"
mysqladmin shutdown

# Wait for the MySQL daemon to exit.
wait $mysql_pid
