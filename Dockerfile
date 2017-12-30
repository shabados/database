# Dockerfile to build database
FROM node:8

WORKDIR /usr/src/app

# Install knex and sqlite3 globally
RUN npm install -g knex sqlite3

# Copy sources into current di
COPY . .

# Build the DB by migrating schema and then inserting seed files
CMD ["knex", "migrate", "latest", "&&", "knex", "seed:run"]
