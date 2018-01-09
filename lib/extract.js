/**
 * Generates sources from DB
 */

const { createDir, writeJSON, akharToUnicode } = require( './utils' )

const knex = require( 'knex' )( require( '../knexfile' ) )

const OUTPUT_DIR = './seeds'


const getTable = async tableName => knex( tableName ).select().map( ( { name } ) => name )

const main = async () => {
  // Pull out lists from two-columned tables
  const sources = await getTable( 'sources' )
  const writers = await getTable( 'writers' )
  const lineTypes = await getTable( 'line_types' )
  const raags = await getTable( 'raags' )
  const banis = await getTable( 'banis' )

  // Write these all to JSON files
  await Promise.all( [
    [ sources, `${OUTPUT_DIR}/sources.json` ],
    [ writers, `${OUTPUT_DIR}/writers.json` ],
    [ raags, `${OUTPUT_DIR}/raags.json` ],
    [ lineTypes, `${OUTPUT_DIR}/line_types.json` ],
  ].map( ( [ data, path ] ) => writeJSON( path, data ) ) )

  const banisDir = `${OUTPUT_DIR}/banis`
  createDir( banisDir )

  // Generate the files for each of the banis, with ranges
  banis.forEach( async name => {
    const id = banis.indexOf( name ) + 1
    const path = `${banisDir}/${name}.json`

    const lines = ( await knex( 'bani_lines' )
      .min( 'line_id as start_line' )
      .max( 'line_id as end_line' )
      .where( 'bani_id', id )
      .groupBy( 'line_group' ) )

    await writeJSON( path, lines )
    console.log( `Bani ${name} written to ${path}` )
  } )

  console.log( `Loaded sources: ${sources}` )
  sources.forEach( async source => {
    const sourceId = sources.indexOf( source ) + 1
    const sourcesDir = `${OUTPUT_DIR}/sources/${source}`
    const shabadsDir = `${OUTPUT_DIR}/shabads/${source}`

      // Create source folder if it does not already exist
    ;[ sourcesDir, shabadsDir ].forEach( createDir )

    // Create shabad files, by writer
    writers.forEach( async ( name, index ) => {
      const id = index + 1
      const path = `${shabadsDir}/${name}.json`

      const shabads = await knex( 'shabads' )
        .select()
        .where( 'source_id', sourceId )
        .andWhere( 'writer_id', id )
        .orderBy( 'id' )

      if ( shabads.length ) {
        await writeJSON( path, shabads )
        console.log( `Wrote shabads for writer ${name} to ${path}` )
      }
    } )

    // Now create "hashed" subdirectories of pages, based on length of source
    const count = ( await knex( 'lines' )
      .join( 'shabads', 'shabads.id', 'lines.shabad_id' )
      .max( 'ang' )
      .where( 'source_id', sourceId )
      .first() )[ 'max(`ang`)' ]

    console.log( `Source ${source} has ${count} pages` )

    // Create directories in 100s up to count
    for ( let angBatch = 1; angBatch <= count; angBatch += 100 ) {
      // Pad directory names
      const dirName = `${angBatch}`.padStart( `${count}`.length, '0' )
      const numberDir = `${sourcesDir}/${dirName}`
      createDir( numberDir )

      // Load all the lines for the source within the current batch
      const lines = await knex( 'lines' )
        .select( [
          'lines.id as id',
          'ang',
          'shabad_id',
          'pada',
          'source_line',
          'gurmukhi',
          'transliteration',
          'translation',
          'punjabi',
          'pronunciation',
          'lines.type_id', // Override shabads.type_id
        ] )
        .join( 'shabads', 'shabads.id', 'lines.shabad_id' )
        .whereBetween( 'ang', [ angBatch, angBatch + 99 ] )
        .andWhere( 'source_id', sources.indexOf( source ) + 1 )
        .orderBy( 'lines.id' )

      const angs = lines
      // Convert ascii to unicode
        .map( line => ( {
          ...line,
          gurmukhi: akharToUnicode( line.gurmukhi ),
          pronunciation: akharToUnicode( line.pronunciation ),
        } ) )
        // Transform each line into groups of angs
        .reduce( ( angs, line ) => ( {
          ...angs,
          [ line.ang ]: [ ...( angs[ line.ang ] || [] ),
            { // Remove ang from object
              ...line,
              ang: undefined,
            } ],
        } ), {} )

      // Write all of the angs in the batch to json files
      await Promise.all( Object.entries( angs ).map( ( [ ang, lines ] ) => {
        // Pad the filenames up to the longest file in the directory
        const fileName = `${ang}`.padStart( `${angBatch + 99}`.length, '0' )
        return writeJSON( `${numberDir}/${fileName}.json`, lines )
      } ) )

      console.log( `Wrote batch ${angBatch} for source ${source}` )
    }
  } )
}

main().catch( e => console.error( e ) )
