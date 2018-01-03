/**
 * Generates sources from DB
 */

const { createDir, writeJSON } = require( './utils' )

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
    [ banis, `${OUTPUT_DIR}/banis.json` ],
    [ writers, `${OUTPUT_DIR}/writers.json` ],
    [ raags, `${OUTPUT_DIR}/raags.json` ],
    [ lineTypes, `${OUTPUT_DIR}/line_types.json` ],
  ].map( ( [ data, path ] ) => writeJSON( path, data ) ) )


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

    // Used to keep track of banis across angs
    const currentBanis = new Set()
    // Create directories in 100s up to count
    for ( let angBatch = 1; angBatch <= count; angBatch += 100 ) {
      const numberDir = `${sourcesDir}/${angBatch}`
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

      const baniLines = await knex( 'bani_lines' )
        .select()
        .whereBetween( 'line_id', [ lines[ 0 ].id, lines[ lines.length - 1 ].id + 1 ] ) // Get one extra line
        // Bucket into groups of line_ids
        .reduce( ( lines, { line_id, bani_id: baniId } ) => ( {
          ...lines,
          [ line_id ]: [ ...( lines[ line_id ] || [] ), baniId ],
        } ), {} )


      // Transform each line into groups of angs with bani ranges attaches
      const angs = lines
        .map( line => {
          const { id } = line
          // A list banis for the current line and next lines
          const banis = baniLines[ id ] || []
          const nextBaniLine = baniLines[ id + 1 ] || []

          // The bani starts here if we aren't currently tracking it
          const startBanis = banis.filter( baniId => (
            !currentBanis.has( baniId ) && currentBanis.add( baniId )
          ) )

          // The bani ends here if it doesn't appear in the next item, stop tracking it
          const endBanis = banis.filter( baniId => (
            currentBanis.has( baniId )
            && !nextBaniLine.includes( baniId )
            && currentBanis.delete( baniId )
          ) )

          return {
            ...line,
            startBanis,
            endBanis,
          }
        } )
        // Bucket the lines into angs
        .reduce( ( angs, line ) => ( {
          ...angs,
          [ line.ang ]: [ ...( angs[ line.ang ] || [] ),
            { // Remove id and ang from object
              ...line,
              ang: undefined,
              id: undefined,
              // Remove startBanis and endBanis if they're empty
              startBanis: line.startBanis.length ? line.startBanis : undefined,
              endBanis: line.endBanis.length ? line.endBanis : undefined,
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
