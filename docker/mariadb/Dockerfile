# Multi-stage docker build. Builds data first, and then switches to pure MariaDB.

FROM mariadb:10.4.7 as generate

WORKDIR /usr/app

ENV KNEXFILE=./docker/mariadb/knexfile
ENV MYSQL_DATABASE=shabad-os
ENV MYSQL_USER=shabad-os
ENV MYSQL_ALLOW_EMPTY_PASSWORD=yes

# Install node
RUN apt-get update
RUN apt-get -y install curl gnupg
RUN curl -sL https://deb.nodesource.com/setup_10.x  | bash -
RUN apt-get -y install nodejs

# Copy and install dependencies
COPY ./package*.json ./
RUN npm ci --no-audit
RUN npm i mysql --no-audit

# Copy repo
COPY . .

# Build it
COPY docker/mariadb/my.cnf /etc/mysql/my.cnf
RUN docker/mariadb/build_db.sh

## Just the DB with data
FROM mariadb:10.4.7

COPY --from=generate /etc/mysql /etc/mysql
COPY --from=generate /var/lib/mysql /var/lib/mysql

ENTRYPOINT []