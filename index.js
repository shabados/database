/**
 * Sets up all the models and re-exports them with names.
 * @ignore
 */

// Must bind any models to knex database connection
const { Model } = require( 'objection' )
const Knex = require( 'knex' )
const config = require( './knexfile' )

// Initialise knex with connection to sqlite file
const knex = Knex( config )
// Bind it to Objection
Model.knex( knex )

// Import all the models
const Banis = require( './lib/models/Banis' )
const Lines = require( './lib/models/Lines' )
const LineTypes = require( './lib/models/LineTypes' )
const Sections = require( './lib/models/Sections' )
const Subsections = require( './lib/models/Subsections' )
const Shabads = require( './lib/models/Shabads' )
const Sources = require( './lib/models/Sources' )
const Writers = require( './lib/models/Writers' )
const Transliterations = require( './lib/models/Transliterations' )
const Translations = require( './lib/models/Translations' )
const TranslationSources = require( './lib/models/TranslationSources' )
const Languages = require( './lib/models/Languages' )

const { connection: { filename } } = config

module.exports = {
  Banis,
  Languages,
  Lines,
  LineTypes,
  Transliterations,
  Translations,
  TranslationSources,
  Sections,
  Subsections,
  Shabads,
  Sources,
  Writers,
  knex,
  filename,
}
