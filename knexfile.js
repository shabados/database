const path = require( 'path' )
const fs = require( 'fs' )

// Ensure build directory exists so sqlite can open the file reliably
const buildDir = path.join( __dirname, 'build' )
try {
  if ( !fs.existsSync( buildDir ) ) fs.mkdirSync( buildDir, { recursive: true } )
} catch ( e ) {
  // If we can't create it here, let knex/sqlite surface the error later
}

const config = {
  client: 'better-sqlite3',
  connection: { filename: path.join( buildDir, 'database.sqlite' ) },
  useNullAsDefault: true,
}

module.exports = config
