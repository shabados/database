# Dockerfile to build database
FROM node:8

WORKDIR /usr/src/app

# Install knex globally and sqlite3 locally
RUN npm install sqlite3 knex
RUN npm install -g knex

# Copy sources into current dir
COPY . .

# Build the DB by migrating schema and then inserting seed files
CMD ["knex", "migrate:latest", "&&", "knex", "seed:run"]
