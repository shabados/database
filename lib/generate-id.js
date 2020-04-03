const commander = require( 'commander' )
const { generateId } = require( './utils' )
const colors = require( './string-colors' )
const { Shabads, Lines } = require( '../' )

/**
 * Finds a possible free id that can be used in the table the `model` refers to.
 * @param {Object} model The Objection model representing the table to generate the id for.
 * @param {Number} length The length of the id to generate.
 */
const findId = async ( model, length ) => {
  // Grab ids to exclude from database
  const ids = new Set( ( await model.query().select( 'id' ) ).map( ( { id } ) => id ) )

  // Poor man's search for an id that's not taken
  let id
  while ( !id || ids.has( id ) ) {
    id = generateId( length )
  }

  return id
}

/**
   * Logs the generated id to the console
   * @param {Number} count the count of id to generate
   * @param {String} type shabad, line
   */
const logGeneratedID = async function ( count, type ) {
  let i = 0

  if ( type === 'shabad' ) {
    for ( i = 0; i < count; i += 1 ) {
      console.log( `${i + 1}. New Shabad ID: `.bold.magenta + `${await findId( Shabads, 3 )}`.rainbow )
    }
  } else if ( type === 'line' ) {
    for ( i = 0; i < count; i += 1 ) {
      console.log( `${i + 1}. New Line ID: `.bold.magenta + `${await findId( Lines, 4 )}`.rainbow )
    }
  } else { // Default log all types
    for ( i = 0; i < count; i += 1 ) {
      console.log( `${i + 1}. New Shabad ID: `.bold.magenta + `${await findId( Shabads, 3 )}`.rainbow )
      console.log( `${i + 1}. New Line ID: `.bold.cyan + `${await findId( Lines, 4 )}`.rainbow )
    }
  }
}

/**
 * Interpret user command and print the id, using the database.
 */
const main = async () => {
  commander
    .version( '0.0.1' )
    .description( 'Generate ID\'s for ShabadOS Database \n\nCommand \nshabad \t\tgenerate id\'s for shabads \nline \t\tgenerate id\'s for line' )
    .option( '-c, --count <integer>', 'number of ID\'s', 1 )
    .option( '-t, --type [command]', 'generate ID for only [command]' )
    .parse( process.argv )

  await logGeneratedID( commander.count, commander.type )
}

main()
  .then( () => process.exit( 0 ) )
  .catch( e => console.error( e ) && process.exit( 1 ) )
