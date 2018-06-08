const config = {
  client: 'sqlite3',
  connection: { filename: `${__dirname}/build/database.sqlite` },
  useNullAsDefault: true,
  migrations: { directory: './lib/migrations' },
}

module.exports = config
