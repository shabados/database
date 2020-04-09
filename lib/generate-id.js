const commander = require( 'commander' )

const { generateId } = require( './utils' )
const { Shabads, Lines } = require( '../' )

// Support ID types and lengths
const ID_TYPES = {
  shabad: [ Shabads, 3 ],
  line: [ Lines, 4 ],
}

/**
 * Finds a possible free id that can be used in the table.
 * @param {Set} ids table to generate the id for.
 * @param {Number} length The length of the id to generate.
 */
const findId = ( ids, length ) => {
  // Poor man's search for an id that's not taken
  let id
  while ( !id || ids.has( id ) ) {
    id = generateId( length )
  }

  return id
}

/**
 * Logs the id to the console
 * @param {Number} count the count of id to generate
 * @param {String} type check `idTypes`
 */
const generateIds = async ( count, type ) => {
  const [ Model, idLength ] = ID_TYPES[ type ]

  // Grab ids to exclude from database
  const ids = new Set( ( await Model.query().select( 'id' ) ).map( ( { id } ) => id ) )

  // Loop to print id's and adds the generated id in the Set
  for ( let i = 0; i < count; i += 1 ) {
    const newId = await findId( ids, idLength )
    ids.add( newId )

    console.log( newId )
  }
}

/**
  * Interpret user command and print the id, using the database.
  */
const main = async () => {
  commander
    .version( '0.0.1' )
    .description( 'Generate IDs for Shabad OS Database' )
    .option( '-c, --count <integer>', 'number of IDs', 1 )
    .requiredOption( '-t, --type [type]', '[type] of ID to generate' )
    .parse( process.argv )

  const { count, type } = commander
  try {
    await generateIds( count, type )
  } catch ( e ) {
    if ( e instanceof TypeError ) {
      console.log( 'Invalid value for type parameter\n' )
      console.log( 'Available types are: \n' )
      console.log( Object.keys( ID_TYPES ).join( '\n' ) )
    } else {
      console.error( e )
    }
  }
}

main()
  .then( () => process.exit( 0 ) )
  .catch( e => console.error( e ) && process.exit( 1 ) )
