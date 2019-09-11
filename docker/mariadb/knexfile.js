const config = {
  client: 'mysql',
  connection: {
    // socketPath: '/var/run/mysqld/mysqld.sock',
    host: 'localhost',
    user: 'shabad-os',
    database: 'shabad-os',
  },
  useNullAsDefault: true,
}

module.exports = config
