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
 * Generates a line id and a shabad id, using the database.
 */
const main = async () => {
  console.log( 'New Line ID: '.bold.cyan + `${await findId( Lines, 4 )}`.rainbow )
  console.log( 'New Shabad ID: '.bold.magenta + `${await findId( Shabads, 3 )}`.rainbow )
}

main()
  .then( () => process.exit( 0 ) )
  .catch( e => console.error( e ) && process.exit( 1 ) )
