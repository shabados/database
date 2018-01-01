/**
 * Script to generate JSON files from original release DB
 */

const fs = require( 'fs' )

const knex = require( 'knex' )( {
  client: 'sqlite3',
  connection: { filename: './data.sqlite' },
} )

const OUTPUT_DIR = '../seeds'

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
    const dir = `${OUTPUT_DIR}/${source}`

    // Create source folder if it does not already exist
    if ( !fs.existsSync( dir ) ) {
      fs.mkdirSync( dir )
    }

    // Now create "hashed" subdirectories of pages, using counts
    const count = ( await knex( 'SHABAD' )
      .max( 'ang_id' )
      .where( 'SOURCE_ID', source )
      .first() )[ 'max(`ang_id`)' ]
    console.log( `Source ${source} has ${count} pages` )

    // Create directories in 100s up to count
    for ( let i = 1; i <= count; i += 100 ) {
      const number_dir = `${dir}/${i}`
      // Create folder of number of page in 100s
      if ( !fs.existsSync( number_dir ) ) {
        fs.mkdirSync( number_dir )
      }
    }

  }

}

main().catch( e => console.error( e ) )
