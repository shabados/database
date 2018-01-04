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
const BANIS_DIR = 'banis'

// Map each of sources to a table name
const tables = {
  raags,
  sources,
  writers,
  line_types: lineTypes,
}

// Transform each of the independent json files and then insert into DB
const insertTables = ( knex, trx ) => Promise.all( (
  Object.entries( tables )
    .map( ( [ tableName, data ] ) => knex
      .batchInsert( tableName, data.map( ( name, index ) => ( { id: index + 1, name } ) ) )
      .transacting( trx ) )
) )

// Inserts all the banis into the bani and bani_lines tables
const insertBanis = async ( knex, trx ) => {
  // Get the bani names
  const banis = readdirSync( `seeds/${BANIS_DIR}` ).map( stripExtension )

  // Insert all the banis
  for ( const name of banis ) {
    const [ baniId ] = await knex( 'banis' )
      .insert( { name } )
      .returning( '*' )
      .transacting( trx )

    // eslint-disable-next-line
    const baniLines = require( `./${BANIS_DIR}/${name}` )
    // Generate line_ids between start_line and end_line
      .map( ( { start_line: startLine, end_line: endLine } ) => Array.from(
        new Array( ( endLine - startLine ) + 1 ),
        ( val, index ) => index + startLine,
      ) )
      // Group into their lines, and flatten them
      .reduce( ( lines, groups, index ) => [
        ...lines,
        ...groups.map( lineId => ( {
          bani_id: baniId,
          line_id: lineId,
          line_group: index + 1,
        } ) ),
      ], [] )

    // Insert into the database
    await Promise.all( baniLines.map( baniLine => (
      knex( 'bani_lines' ).insert( baniLine ).transacting( trx )
    ) ) )
  }
}

// Retrieves, flattens, and inserts the shabads from the various folders
const insertShabads = async ( knex, trx ) => {
  const shabads = readdirSync( `seeds/${SHABADS_DIR}` )
    .sort( ( s1, s2 ) => sources.indexOf( s1 ) - sources.indexOf( s2 ) )
    .reduce( ( data, source ) => [
      ...data,
      ...readdirSync( `seeds/${SHABADS_DIR}/${source}` )
        .map( stripExtension )
        // eslint-disable-next-line
        .map( writer => [ writer, require( `./${SHABADS_DIR}/${source}/${writer}` ) ] )
        .map( ( [ writer, shabads ] ) => shabads.map( shabad => ( {
          ...shabad,
          source_id: sources.indexOf( source ) + 1,
          writer_id: writers.indexOf( writer ) + 1,
        } ) ) ),
    ], [] )
    .reduce( ( allData, data ) => [ ...allData, ...data ], [] )

  // Insert all the shabads
  await Promise.all( shabads.map( shabad => (
    knex( 'shabads' ).insert( shabad ).transacting( trx )
  ) ) )
}

// Retrieves, flattens, and inserts all the lines from the nested folders
const insertLines = async ( knex, trx ) => {
  // Insert all the lines
  const lines = readdirSync( `seeds/${SOURCES_DIR}` )
    .sort( ( s1, s2 ) => sources.indexOf( s1 ) - sources.indexOf( s2 ) )
    .reduce( ( data, source ) => [
      ...data,
      ...readdirSync( `seeds/${SOURCES_DIR}/${source}` )
        .sort( ( a1, a2 ) => a1 - a2 )
        .reduce( ( data, batch ) => [
          ...data,
          ...readdirSync( `seeds/${SOURCES_DIR}/${source}/${batch}` )
            .map( stripExtension )
            .sort( ( a1, a2 ) => a1 - a2 )
            // eslint-disable-next-line
            .map( ang => [ ang, require( `./${SOURCES_DIR}/${source}/${batch}/${ang}` ) ] )
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
}

exports.seed = knex => knex.transaction( async trx => {
  await insertTables( knex, trx )
  await insertBanis( knex, trx )
  await insertShabads( knex, trx )
  await insertLines( knex, trx )
} )
