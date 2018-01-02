/**
 * Seeds the database with the content of the JSON files
 * @param knex A provided instance of knex
 */

const raags = require( './raags' )
const sources = require( './sources' )
const writers = require( './writers' )
const lineTypes = require( './line_types' )

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

} )
