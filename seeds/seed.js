/**
 * Seeds the database with the content of the JSON files
 * @param knex A provided instance of knex
 */

const { readdirSync } = require( 'fs' )
const { basename } = require( 'path' )

const raags = require( './raags' )
const sources = require( './sources' )
const writers = require( './writers' )
const lineTypes = require( './line_types' )

const SHABADS_DIR = 'shabads'
const SOURCES_DIR = 'sources'

const stripExtension = name => basename( name, '.json' )

// Map each of sources to a table name
const tables = {
  raags,
  sources,
  writers,
  line_types: lineTypes
}

exports.seed = knex => knex.transaction( async trx => {
  // Transform each of the files and then insert into DB
  await Promise.all( Object.entries( tables ).map( ( [ tableName, data ] ) =>
    // Transform each array item into { id, name } objects
    knex
      .batchInsert( tableName, data.map( ( name, index ) => ( { id: index + 1, name } ) ) )
      .transacting( trx )
  ) )

  // Insert all the shabads
  const shabads = readdirSync( `seeds/${SHABADS_DIR}` )
    .reduce( ( data, source ) => [
      ...data,
      ...readdirSync( `seeds/${SHABADS_DIR}/${source}` )
        .map( stripExtension )
        .map( writer => [ writer, `./${SHABADS_DIR}/${source}/${writer}` ] )
        .map( ( [ writer, path ] ) => [ writer, require( path ) ] )
        .map( ( [ writer, shabads ] ) => shabads.map( shabad => ( {
          ...shabad,
          source_id: sources.indexOf( source ) + 1,
          writer_id: writers.indexOf( writer ) + 1
        } ) ) )
    ], [] )
    .reduce( ( allData, data ) => [ ...allData, ...data ], [] )

  await Promise.all( shabads.map( shabad => knex( 'shabads' )
    .insert( shabad )
    .transacting( trx ) ) )

  // Insert all the lines
  // TODO: insert in order of sources.json to start SGGS from line 1 here
  const lines = readdirSync( `seeds/${SOURCES_DIR}` )
    .reduce( ( data, source ) => [
      ...data,
      ...readdirSync( `seeds/${SOURCES_DIR}/${source}` )
        .reduce( ( data, batch ) => [
          ...data,
          ...readdirSync( `seeds/${SOURCES_DIR}/${source}/${batch}` )
            .map( stripExtension )
            .map( ang => [ ang, `./${SOURCES_DIR}/${source}/${batch}/${ang}` ] )
            .map( ( [ ang, path ] ) => [ ang, require( path ) ] )
            .map( ( [ ang, lines ] ) => lines.map( line => ( {
              ...line,
              ang
            } ) ) )
        ], [] )
    ], [] )
    .reduce( ( allData, data ) => [ ...allData, ...data ], [] )

  await Promise.all( lines.map( lines => knex( 'lines' )
    .insert( lines )
    .transacting( trx )
  ) )

} )
