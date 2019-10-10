const program = require( 'commander' )
const sqlite = require( 'sqlite' )

const { Lines, Shabads, Sources, TranslationSources, Translations, knex } = require( '../' )

const { generateId } = require( './utils' )
require( './string-colors' )

const columnOpts = [ 'shabadId', 'translation', 'page', 'line', 'sttmId', 'gurmukhi', 'orderBy', 'source' ]

const findIds = async ( model, length, count ) => {
  // Grab ids to exclude from database
  const ids = new Set( ( await model.query().select( 'id' ) ).map( ( { id } ) => id ) )

  const newIds = []
  while ( newIds.length < count ) {
    const id = generateId( length )
    if ( !ids.has( id ) ) {
      ids.add( id )
      newIds.push( id )
    }
  }

  return newIds
}

const main = async () => {
  program
    .version( '0.0.1' )
    .arguments( '<input> <tableName>' )
    .option( '-o, --order-by <column>', 'order column name' )
    .option( '-s, --shabad-id <column>', 'Shabad ID column name' )
    .option( '-S, --source <column>', 'Source column name', -1 )
    .option( '-2, --sttm-id <column>', 'STTM2 Shabad ID column name' )
    .option( '-t, --translation <column>', 'column name of a translation', ( val, prev ) => [ ...prev, val ], [] )
    .option( '-p, --page <column>', 'Page number column name' )
    .option( '-l, --line <column>', 'Line number column name' )
    .option( '-g, --gurmukhi <column>', 'Gurmukhi column name' )
    .parse( process.argv )

  const [ filename, tableName ] = program.args

  if ( !( filename && tableName ) ) program.outputHelp()

  // Extract the column names, provided as options
  const { orderBy, shabadId, sttmId, source, gurmukhi, translation, line, page } = Object
    .entries( program.opts() )
    .filter( ( [ , value ] ) => !!value )
    .filter( ( [ key ] ) => columnOpts.includes( key ) )
    .reduce( ( opts, [ key, value ] ) => ( { ...opts, [ key ]: value } ), {} )

  console.log( `Running import CLI with options: ${JSON.stringify( program.opts() )}\n`.subheader )

  // Open target DB and fetch all the target data, then close it
  console.log( `Opening database ${filename}`.header )
  const db = await sqlite.open( filename )
  const lines = await db.all( `SELECT * FROM ${tableName} ORDER BY ${orderBy}` )
  const shabadIds = ( await db.all( `SELECT DISTINCT ${shabadId} FROM ${tableName}` ) ).map( x => x[ shabadId ] )
  const sources = ( await db.all( `SELECT DISTINCT ${source} FROM ${tableName}` ) ).map( x => x[ source ] )
  const sttmIds = ( await db.all( `SELECT DISTINCT ${sttmId} FROM ${tableName}` ) ).map( x => x[ sttmId ] )
  await db.close()

  // Generate some Line and Shabad IDs and map them in
  console.log( 'Generating IDs'.header )
  const newShabadIDs = await findIds( Shabads, 3, shabadIds.length )
  const newLineIDs = await findIds( Lines, 4, lines.length )
  const newSourceId = ( await Sources.query().orderBy( 'id', 'desc' ).first() ).id + 1
  const newTranslationSourceId = ( await TranslationSources.query().orderBy( 'id', 'desc' ).first() ).id + 1

  // Get last order IDs
  const { orderId: shabadOrderId } = await Shabads.query().orderBy( 'order_id', 'desc' ).first()
  const { orderId: lineOrderId } = await Lines.query().orderBy( 'order_id', 'desc' ).first()

  console.log( 'Mapping data'.header )
  // Map all the old shabad IDs to new ones
  const shabadIDMap = shabadIds.reduce( ( ids, id, index ) => ( {
    ...ids,
    [ id ]: newShabadIDs[ index ],
  } ), {} )

  // Map sources to original shabad id
  const sourceMap = lines.reduce( ( sourceMap, line ) => ( {
    ...sourceMap,
    [ line[ shabadId ] ]: (
      newSourceId
      + sources.findIndex( sourceName => sourceName === line[ source ] )
    ),
  } ), {} )

  // Generate sources
  const newSources = sources.map( ( name, index ) => ( {
    name_english: `${name}-new`,
    name_gurmukhi: `${name}-new`,
    id: newSourceId + index,
    length: -1,
    page_name_english: -( index + 1 ),
    page_name_gurmukhi: -( index + 1 ),
  } ) )

  if ( sttmIds && sttmIds.length !== shabadIds.length ) {
    console.log( 'Different number of STTM IDs to Shabads'.error )
    return
  }

  // Generate new Shabads
  const newShabads = shabadIds.map( ( id, index ) => ( {
    id: shabadIDMap[ id ],
    writer_id: -1,
    section_id: -1,
    sttm_id: sttmIds[ index ],
    order_id: shabadOrderId + index + 1,
    source_id: sourceMap[ id ],
  } ) )

  // Generate the new lines
  const newLines = lines.map( ( data, index ) => ( {
    id: newLineIDs[ index ],
    shabad_id: shabadIDMap[ data[ shabadId ] ],
    gurmukhi: data[ gurmukhi ],
    source_page: data[ page ] || -1,
    source_line: data[ line ] || -1,
    order_id: lineOrderId + 1 + index,
  } ) )

  // Generate translation sources for translations
  const newTranslationSources = sources.map( ( sourceName, sourceIndex ) =>
    translation.map( ( name, index ) => ( {
      id: ( translation.length * sourceIndex ) + newTranslationSourceId + index,
      name_gurmukhi: `${sourceName}-${name}`,
      name_english: `${sourceName}-${name}`,
      source_id: newSourceId + sourceIndex,
      language_id: -( index + 1 ),
    } ) ) )
    .reduce( ( AllSources, translationSources ) => AllSources.concat( translationSources ), [] )

  // Generate the translations
  const newTranslations = translation
    .map( ( name, index ) => lines.map( ( data, lineIndex ) => ( {
      line_id: newLineIDs[ lineIndex ],
      translation_source_id: (
        newTranslationSourceId
        + index
        + ( translation.length * sources.findIndex( sourceName => sourceName === data[ source ] ) )
      ),
      translation: data[ name ] || '',
      additional_information: '{}',
    } ) ) )
    .reduce( ( allTranslations, translations ) => allTranslations.concat( translations ), [] )

  // Now, insert all the data
  console.log( 'Inserting into SQLite database'.header )
  await knex.transaction( async trx => {
    // Insert sources
    await Promise.all( newSources.map( source => Sources.query( trx ).insert( source ) ) )
    // Insert shabad IDs
    await Promise.all( newShabads.map( shabad => Shabads.query( trx ).insert( shabad ) ) )
    // Insert lines
    await Promise.all( newLines.map( line => Lines.query( trx ).insert( line ) ) )
    // Insert translation sources
    await Promise.all( newTranslationSources.map( source => (
      TranslationSources.query( trx ).insert( source )
    ) ) )
    // Insert translations
    await Promise.all( newTranslations.map( data => Translations.query( trx ).insert( data ) ) )
  } )

  console.log( 'Import complete. Please update the default values in `build/database.sqlite`. Run `npm run build-json`, followed by `npm run build-sqlite`.'.success )
}

main()
  .then( () => process.exit( 0 ) )
  .catch( e => console.error( e ) || process.exit( 1 ) )
