/**
 * Generates an SQLite DB from the JSON sources in `data/`.
 */

const camelcaseKeys = require( 'camelcase-keys' )

const colors = require( './string-colors' )
const { createDir, removeDirAsync, writeJSON } = require( './utils' )
const createSchema = require( './schema' )
const { knex, Sources, Writers, LineTypes, Languages, Lines, Shabads, Sections, Subsections, TranslationSources, Translations } = require( '../' )

const OUTPUT_PATH = './build'
const OUTPUT_FILE = `${OUTPUT_PATH}/database.sqlite`

/**
 * Creates the database tables using the schema.
 */
const initialiseDatabase = async () => {
  console.log( '\nCreating tables'.subheader )
  await createSchema( knex )
  console.log( 'Created tables successfully'.success )
}

const main = async () => {
  console.log( 'Generating SQLite database'.header )

  // Create directory for DB file
  await removeDirAsync( OUTPUT_PATH )
  createDir( OUTPUT_PATH )

  // Create tables from schema
  await initialiseDatabase()
}

main()
  .then( () => process.exit( 0 ) )
  .catch( async e => {
    console.error( e )
    console.log( '\nFailed to generate SQLite database'.error.bold )
    process.exit( 1 )
  } )
