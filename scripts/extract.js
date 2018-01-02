/**
 * One-time script to generate JSON files from original release DB
 */

const fs = require( 'fs' )
const { promisify } = require( 'util' )

const writeFileAsync = promisify( fs.writeFile )

const line_types = require( '../seeds/line_types' )
const sources = require( '../seeds/sources' )

const knex = require( 'knex' )( {
  client: 'sqlite3',
  connection: { filename: 'build/database.sqlite' },
} )

const OUTPUT_DIR = './seeds'

const main = async () => {
  console.log( 'Fetching sources from shabads' )
  const sources = (
    await knex.distinct( 'SOURCE_ID' )
      .select()
      .from( 'SHABAD' )
  ).map( ( { SOURCE_ID } ) => SOURCE_ID )
  console.log( `Found sources: ${sources}` )

  // Create directories and sub-directories for each source
  for ( let source of sources ) {
    const sources_dir = `${OUTPUT_DIR}/sources/${source}`
    const shabads_dir = `${OUTPUT_DIR}/shabads/${source}`

    // Create source folder if it does not already exist
    const _ = [ sources_dir, shabads_dir ].forEach( d => {
      if ( !fs.existsSync( d ) ) {
        fs.mkdirSync( d )
      }
    } )

    // Now create "hashed" subdirectories of pages, using counts
    const count = ( await knex( 'SHABAD' )
      .max( 'ang_id' )
      .where( 'SOURCE_ID', source )
      .first() )[ 'max(`ang_id`)' ]
    console.log( `Source ${source} has ${count} pages` )

    let shabads = {}
    // Create directories in 100s up to count
    for ( let ang_batch = 1; ang_batch <= count; ang_batch += 100 ) {
      console.log( `Writing batch ${ang_batch}` )

      const number_dir = `${sources_dir}/${ang_batch}`
      // Create folder of number of page in 100s
      if ( !fs.existsSync( number_dir ) ) {
        fs.mkdirSync( number_dir )
      }


      // TODO: fix this to use shabad translations etc
      const angs = await ( knex( 'shabad' )
          .select( `shabad_id, line_id, raag_id, ang_id, shabad.gurmukhi, shabad.transliteration, 
          shabad.punjabi, shabad.english, pronunciation, pada, type, writer_id, source_id` )
          .join( 'gurmukhi', 'gurmukhi.tuk', 'shabad.pk' )
          .whereBetween( 'ang_id', [ ang_batch, ang_batch + 99 ] )
          .andWhere( 'source_id', source )
      ).reduce( ( angs, {
        SHABAD_ID: shabad_id,
        LINE_ID: source_line,
        RAAG_ID: raag_id,
        ANG_ID: ang,
        GURMUKHI: gurmukhi,
        TRANSLITERATION: transliteration,
        PUNJABI: punjabi,
        ENGLISH: translation,
        PRONUNCIATION: pronunciation,
        PADA: pada,
        TYPE: line_type,
        WRITER_ID: writer_id,
        SOURCE_ID: source
      } ) => {

        const shabad = {
          id: shabad_id,
          raag_id,
          source_id: sources.indexOf( source ) + 1,
          writer_id
        }

        shabads = {
          ...shabads,
          [ writer_id ]: ( shabads[ writer_id ] || [] ).find( ( { id } ) => id === shabad.id )
            ? [ ...( shabads[ writer_id ] || [] ) ]
            : [ ...( shabads[ writer_id ] || [] ), shabad ]
        }

        const line = {
          shabad_id,
          pada,
          source_line,
          gurmukhi,
          transliteration,
          translation,
          punjabi,
          pronunciation,
          type_id: ( line_types.indexOf( line_type ) + 1 ) || null // ( -1 + 1 ) || null === null
        }

        return { ...angs, [ ang ]: [ ...( angs[ ang ] || [] ), line ] }


      }, {} )

      await Promise.all( Object.entries( angs ).map( ( [ ang, lines ] ) => {
        const path = `${number_dir}/${ang}.json`

        return writeFileAsync( path, JSON.stringify( lines, null, 2 ), { flag: 'w' } )
      } ) )


    }
    await Promise.all( Object.entries( shabads ).map( ( [ writer, shabads ] ) => {
      const path = `${shabads_dir}/${writer}.json`
      return writeFileAsync( path, JSON.stringify( shabads, null, 2 ), { flag: 'w' } )
    } ) )
  }

}

const startTime = Date.now()
main()
  .then( () => console.log( `Took ${( Date.now() - startTime ) / 1000} seconds` ) )
  .catch( e => console.error( e ) )
