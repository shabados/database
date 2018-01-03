/**
 * Generates sources from DB
 */

const { createDir, writeJSON } = require( './utils' )

const knex = require( 'knex' )( require( '../knexfile' ) )

const OUTPUT_DIR = './seeds'


const getTable = async tableName => ( await knex( tableName ).select() ).map( ( { name } ) => name )

const main = async () => {
  // Pull out lists from two-columned tables
  const sources = await getTable( 'sources' )
  const writers = await getTable( 'writers' )
  const lineTypes = await getTable( 'line_types' )
  const raags = await getTable( 'raags' )

  // Write these all to JSON files
  await Promise.all( [
    [ sources, `${OUTPUT_DIR}/sources.json` ],
    [ writers, `${OUTPUT_DIR}/writers.json` ],
    [ raags, `${OUTPUT_DIR}/raags.json` ],
    [ lineTypes, `${OUTPUT_DIR}/line_types.json` ],
  ].map( ( [ data, path ] ) => writeJSON( path, data ) ) )


  console.log( `Loaded sources: ${sources}` )
  sources.forEach( async source => {
    const sourcesDir = `${OUTPUT_DIR}/sources/${source}`
    const shabadsDir = `${OUTPUT_DIR}/shabads/${source}`

      // Create source folder if it does not already exist
    ;[ sourcesDir, shabadsDir ].forEach( createDir )

    // Now create "hashed" subdirectories of pages, based on length of source
    const count = ( await knex( 'lines' )
      .join( 'shabads', 'shabads.id', 'lines.shabad_id' )
      .max( 'ang' )
      .where( 'source_id', sources.indexOf( source ) + 1 )
      .first() )[ 'max(`ang`)' ]
    console.log( `Source ${source} has ${count} pages` )

    // Create directories in 100s up to count
    for ( let angBatch = 1; angBatch <= count; angBatch += 100 ) {
      const numberDir = `${sourcesDir}/${angBatch}`
      createDir( numberDir )

      // Load all the lines for the source within the current batch
      const angs = await ( knex( 'lines' )
        .select( [
          'ang',
          'shabad_id',
          'pada',
          'source_line',
          'gurmukhi',
          'transliteration',
          'translation',
          'punjabi',
          'pronunciation',
          'lines.type_id',
        ] ) // Override shabads.type_id
        .join( 'shabads', 'shabads.id', 'lines.shabad_id' )
        .whereBetween( 'ang', [ angBatch, angBatch + 99 ] )
        .andWhere( 'source_id', sources.indexOf( source ) + 1 ) )
        .orderBy( 'lines.id' )
        .reduce( ( angs, line ) => ( {
          ...angs,
          [ line.ang ]: [ ...( angs[ line.ang ] || [] ),
            { // Remove ang from object
              ...line,
              ang: undefined,
            } ],
        } ), {} )

      // Write all of the angs in the batch to json files
      await Promise.all( Object.entries( angs ).map( ( [ ang, lines ] ) => (
        writeJSON( `${numberDir}/${ang}.json`, lines )
      ) ) )

      console.log( `Wrote batch ${angBatch} for source ${source}` )
    }
  } )
}

main().catch( e => console.error( e ) )
