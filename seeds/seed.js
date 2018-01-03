/**
 * Seeds the database with the content of the JSON files
 * @param knex A provided instance of knex
 */

const { readdirSync } = require( 'fs' )

const { stripExtension, generateFirstLetters } = require( '../lib/utils' )

const raags = require( './raags' )
const sources = require( './sources' )
const writers = require( './writers' )
const lineTypes = require( './line_types' )

const SHABADS_DIR = 'shabads'
const SOURCES_DIR = 'sources'


// Map each of sources to a table name
const tables = {
  raags,
  sources,
  writers,
  line_types: lineTypes,
}


exports.seed = knex => knex.transaction( async trx => {
  // Transform each of the files and then insert into DB
  await Promise.all( Object.entries( tables ).map( ( [ tableName, data ] ) =>
    // Transform each array item into { id, name } objects
    knex
      .batchInsert( tableName, data.map( ( name, index ) => ( { id: index + 1, name } ) ) )
      .transacting( trx ) ) )

  // Insert all the shabads
  const shabads = readdirSync( `seeds/${SHABADS_DIR}` )
    .sort( ( s1, s2 ) => sources.indexOf( s1 ) - sources.indexOf( s2 ) )
    .reduce( ( data, source ) => [
      ...data,
      ...readdirSync( `seeds/${SHABADS_DIR}/${source}` )
        .map( stripExtension )
        .map( writer => [ writer, `./${SHABADS_DIR}/${source}/${writer}` ] )
        // eslint-disable-next-line
        .map( ( [ writer, path ] ) => [ writer, require( path ) ] )
        .map( ( [ writer, shabads ] ) => shabads.map( shabad => ( {
          ...shabad,
          source_id: sources.indexOf( source ) + 1,
          writer_id: writers.indexOf( writer ) + 1,
        } ) ) ),
    ], [] )
    .reduce( ( allData, data ) => [ ...allData, ...data ], [] )

  for ( const shabad of shabads ) {
    await knex( 'shabads' ).insert( shabad ).transacting( trx )
  }

  // Insert all the lines
  const lines = readdirSync( `seeds/${SOURCES_DIR}` )
    .sort( ( s1, s2 ) => sources.indexOf( s1 ) - sources.indexOf( s2 ) )
    .reduce( ( data, source ) => [
      ...data,
      ...readdirSync( `seeds/${SOURCES_DIR}/${source}` )
        .reduce( ( data, batch ) => [
          ...data,
          ...readdirSync( `seeds/${SOURCES_DIR}/${source}/${batch}` )
            .map( stripExtension )
            .map( ang => [ ang, `./${SOURCES_DIR}/${source}/${batch}/${ang}` ] )
            // eslint-disable-next-line
            .map( ( [ ang, path ] ) => [ ang, require( path ) ] )
            .map( ( [ ang, lines ] ) => lines.map( line => ( {
              ...line,
              ang,
              first_letters: generateFirstLetters( source, line ),
            } ) ) ),
        ], [] ),
    ], [] )
    .reduce( ( allData, data ) => [ ...allData, ...data ], [] )

  // Use for-of instead to insert lines sequentially and preserve order
  for ( const line of lines ) {
    await knex( 'lines' ).insert( line ).transacting( trx )
  }
} )
