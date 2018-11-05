const { generateId } = require( '../lib/utils' )

const { Shabads, Lines } = require( '../' )

/**
 * Finds a possible free id that can be used in the table the `model` refers to.
 * @param {Object} model The Objection model representing the table to generate the id for.
 * @param {Number} length The length of the id to generate.
 */
const findIds = async ( model, length ) => {
  // Grab ids to exclude from database
  const ids = new Set( ( await model.query().select( 'id' ) ).map( ( { id } ) => id ) )

  // Poor man's search for an id that's not taken
  const list = []
  let orderId = 60554
  let startId = 74212

  while ( list.length < 90000 ) {
    const id = generateId( length )
    if ( !ids.has( id ) ) {
      ids.add( id )
      list.push( id )
      console.log( `${startId++},${id},${++orderId}` )
    }
  }

  return list
}

findIds( Lines, 4 ).then( () => process.exit( 0 ) )
