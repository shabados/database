/**
 * Sets up all the models and re-exports them with names.
 * @ignore
 */

// Must bind any models to knex database connection
const { Model } = require( 'objection' )
const Knex = require( 'knex' )

// Load config file from environment or locally
const { KNEXFILE } = process.env
// eslint-disable-next-line import/no-dynamic-require
const config = require( KNEXFILE || './knexfile' )

// Initialise knex with connection to sqlite file
const knex = Knex( config )
// Bind it to Objection
Model.knex( knex )

// Enable case-sensitivity for LIKE searches in SQLite3
const { client } = config
if ( client === 'sqlite3' ) knex.raw( 'PRAGMA case_sensitive_like = ON' ).then().catch()

// Import all the models
const Banis = require( './lib/models/Banis' )
const Lines = require( './lib/models/Lines' )
const LineTypes = require( './lib/models/LineTypes' )
const Sections = require( './lib/models/Sections' )
const Subsections = require( './lib/models/Subsections' )
const Shabads = require( './lib/models/Shabads' )
const Compositions = require( './lib/models/Compositions' )
const Writers = require( './lib/models/Writers' )
const Transliterations = require( './lib/models/Transliterations' )
const Translations = require( './lib/models/Translations' )
const TranslationSources = require( './lib/models/TranslationSources' )
const Languages = require( './lib/models/Languages' )
const Sources = require( './lib/models/Sources' )
const LineContent = require( './lib/models/LineContent' )

const { connection: { filename } } = config

module.exports = {
  Banis,
  Languages,
  Lines,
  LineContent,
  LineTypes,
  Transliterations,
  Translations,
  TranslationSources,
  Sections,
  Subsections,
  Shabads,
  Compositions,
  Writers,
  Sources,
  knex,
  filename,
}
