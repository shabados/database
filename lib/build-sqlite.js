const build = require( './build-database' )

/**
 * Sets up SQLite pragma settings.
 */
const setSQLiteSettings = async knex => {
  await knex.raw( 'PRAGMA synchronous = "OFF"' )
  await knex.raw( 'PRAGMA journal_mode = "OFF"' )
  await knex.raw( 'PRAGMA cache_size = 100000' )
}

build( { onInitialiseDatabase: setSQLiteSettings, type: 'SQLite ' } )
