const config = {
  client: 'sqlite3',
  connection: { filename: `${__dirname}/build/database.sqlite` },
  useNullAsDefault: true,
}

module.exports = config
