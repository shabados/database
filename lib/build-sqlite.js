/**
 * Generates an SQLite DB from the JSON sources in `data/`.
 */

/* eslint-disable global-require, import/no-dynamic-require */

const { readdirSync, existsSync } = require( 'fs' )
const { transaction } = require( 'objection' )
const memoize = require( 'memoizee' )
const { reduce, map, forEach } = require( 'fast.js' )
const { unload } = require( 'freshy' )
const { firstLetters, transliterate } = require( 'gurmukhi-utils' )

const colors = require( './string-colors' )
const { createDir, removeDirAsync, findIndex } = require( './utils' )
const createSchema = require( './schema' )
const { knex, Sources, Writers, LineTypes, Languages, Sections, Subsections, TranslationSources } = require( '../' )

const JSON_PATH = '../data'
const OUTPUT_PATH = './build'

/**
 * Maps a list of JSON objects to only return the english name.
 * @param {Object} json The json object to map.
 */
const toEnglishName = json => json.map( ( { name_english: nameEnglish } ) => nameEnglish )

const translationSourcesJSON = require( `${JSON_PATH}/translation_sources` )

// Generate a list of the names, so the index of values can be retrieved
const sourceNames = toEnglishName( require( '../data/sources' ) )
const languageNames = toEnglishName( require( '../data/languages' ) )
const writerNames = toEnglishName( require( '../data/writers' ) )
const lineTypeNames = toEnglishName( require( '../data/line_types' ) )

const TranslationSourceNames = toEnglishName( translationSourcesJSON )

/**
 * Finds the index of the translation source provided.
 * @param {String} sourceT The source of the translation source.
 * @param {String} languageT The language of the translation source.
 * @param {String} translationSourceT The translation source name.
 */
const findTranslationSourceIndex = memoize( ( sourceT, languageT, translationSourceT ) => {
  // Find position of correct translation source
  const index = translationSourcesJSON
    .findIndex( ( { source, language, name_english: translationSource } ) => (
      source === sourceT && language === languageT && translationSource === translationSourceT
    ) )

  // If not found, figure out which properties are incorrect
  if ( index === -1 ) {
    findIndex( sourceT, sourceNames )
    findIndex( languageT, languageNames )
    findIndex( translationSourceT, TranslationSourceNames )
  }

  return index
}, { primative: true } )

/**
 * Creates the database tables using the schema.
 */
const initialiseDatabase = async () => {
  console.log( 'Creating tables\n'.subheader )
  await createSchema( knex )
  console.log( 'Created tables successfully'.success )
}

/**
 * Imports any simple tables into the database.
 * @param {Object} trx The transaction to use when executing any queries.
 */
const importSimpleTables = async trx => (
  Promise.all( [
    [ 'writers', Writers ],
    [ 'line_types', LineTypes ],
    [ 'languages', Languages ],
  ]
    .map( async ( [ name, model ] ) => {
      console.log( `Importing table ${name}`.subheader )

      const path = `${JSON_PATH}/${name}`
      const data = require( path )

      await Promise.all( data.map( ( element, index ) => (
        model
          .query( trx )
          .insert( { ...element, id: index + 1 } )
      ) ) )

      // Unload JSON from memory
      unload( path )

      console.log( `Successfully imported table ${name}`.success )
    } ) )
)

/**
 * Imports sources, their sections, and their subsections.
 * @param {Object} trx The transaction to use when executing any queries.
 */
const importSources = async trx => {
  console.log( '\nImporting tables sources, sections, subsections'.subheader )

  // Need id context across sources and sections
  let sectionId = 1
  let subsectionId = 1

  const path = `${JSON_PATH}/sources`

  // Load data and add correct id in order
  const data = require( path )
    .map( ( source, index ) => ( {
      ...source,
      id: index + 1,
      sections: source.sections.map( section => ( {
        ...section,
        id: sectionId++, // eslint-disable-line
        subsections: section.subsections.map( subsection => ( {
          ...subsection,
          id: subsectionId++, // eslint-disable-line
        } ) ),
      } ) ),
    } ) )
  await Sources.query( trx ).insertGraph( data )

  unload( path )

  console.log( 'Successfully imported tables sources, sections, subsections'.success )
}

/**
 * Imports translation sources.
 * @param {Object} trx The transaction to use when executing any queries.
 */
const importTranslationSources = async trx => {
  console.log( '\nImporting table translation_sources'.subheader )

  const path = `${JSON_PATH}/translation_sources.json`

  await Promise.all( (
    require( path )
    // Get source and language ids from string
      .map( ( { source, language, ...rest }, index ) => {
        console.log( `Processing ${rest.name_english}` )

        return {
          ...rest,
          id: index + 1,
          languageId: findIndex( language, languageNames ) + 1,
          sourceId: findIndex( source, sourceNames ) + 1,
        }
      } )
    // Insert the data
      .map( data => TranslationSources.query( trx ).insert( data ) )
  ) )

  unload( path )

  console.log( 'Sucessfully imported table translation_sources'.success )
}

/**
 * Imports lines, shabads, and translations.
 * @param {Object} trx The transaction to use when executing any queries.
 */
const importLines = async trx => {
  console.log( '\nImporting tables lines, shabads, translations'.subheader )

  // Using camelCase since reading from database, not JSON
  const toEnglishName = data => data.map( ( { nameEnglish } ) => nameEnglish )
  // Get section and subsection names (assuming they've been inserted)
  const sectionNames = toEnglishName( await Sections.query( trx ) )
  const subsectionNames = toEnglishName( await Subsections.query( trx ) )

  // Need id context across shabads
  let lineOrderId = 1
  let shabadOrderId = 1

  // Sets storing all the ids
  const shabadIds = new Set()
  const lineIds = new Set()

  // Functions to log duplicate ids
  const checkShabadId = id => ( shabadIds.has( id ) ? console.warn( `Shabad ID ${id} already exists`.warning ) : shabadIds.add( id ) ) && false
  const checkLineId = id => ( lineIds.has( id ) ? console.warn( `Line ID ${id} already exists`.warning ) : lineIds.add( id ) ) && false

  const sourceData = await Promise.all( (
    sourceNames.map( async ( sourceName, sourceIndex ) => {
      console.log( `Processing source ${sourceName}` )

      const sourceDir = `./data/${sourceName}`

      if ( !existsSync( sourceDir ) ) { return [] }

      // Load and concatenate all the shabad files for the source
      const paths = map( readdirSync( sourceDir ), path => `${JSON_PATH}/${sourceName}/${path}` )

      const shabads = reduce( paths, ( acc, path ) => [
        ...acc,
        ...require( path ),
      ], [] )

      // Infer from position in array
      const sourceId = sourceIndex + 1

      // Returns an array of [shabads, [line, translations]]
      const data = map( shabads, ( {
        id: shabadId,
        writer,
        section,
        subsection,
        lines,
        ...rest
      } ) => ( [
        // Shabad is first element
        {
          ...rest,
          id: checkShabadId( shabadId ) || shabadId,
          order_id: shabadOrderId++, // eslint-disable-line
          source_id: sourceId,
          writer_id: findIndex( writer, writerNames ) + 1,
          section_id: findIndex( section, sectionNames ) + 1,
          subsection_id: subsection && findIndex( subsection, subsectionNames ) + 1, // Nullable
        },
        // [Lines, Translations] is the second element
        map( lines, ( { type, translations, gurmukhi, id: lineId, ...rest } ) => ( [
          // First element is lines
          {
            ...rest,
            id: checkLineId( lineId ) || lineId,
            gurmukhi,
            first_letters: firstLetters( gurmukhi ),
            transliteration_english: transliterate( gurmukhi ),
            shabad_id: shabadId,
            order_id: lineOrderId++, // eslint-disable-line
            type_id: type && findIndex( type, lineTypeNames ), // Nullable
          },
          // Second element is translations
          reduce( Object.entries( translations ), ( acc, [ languageName, translations ] ) => [
            ...acc,
            // Flatten translations into one big list
            ...reduce( Object.entries( translations ), ( acc, [
              translationSourceName,
              { translation, additional_information: additionalInformation },
            ] ) => [
              ...acc,
              {
                line_id: lineId,
                translation_source_id: findTranslationSourceIndex(
                  sourceName,
                  languageName,
                  translationSourceName,
                ) + 1,
                translation,
                additional_information: JSON.stringify( additionalInformation ),
              },
            ], [] ),
          ], [] ),
        ] ) ),
      ] ) )

      // Unload the json files
      forEach( paths, path => unload( path ) )

      // Pull out shabads from structure
      const shabadData = map( data, ( [ shabad ] ) => shabad )

      // Mutations/non-reduce to massively increase speed
      const translationData = []
      const lineData = []

      // Pull out the line and translations from the structure
      forEach( data, ( [ , lines ] ) => (
        forEach( lines, ( [ line, translations ] ) => {
          translationData.push( ...translations )
          lineData.push( line )
        } )
      ) )

      // Insert data into all 3 tables
      return Promise.all( [
        trx.batchInsert( 'shabads', shabadData, 140 ),
        trx.batchInsert( 'lines', lineData, 80 ),
        trx.batchInsert( 'translations', translationData, 115 ),
      ] )
    } )
  ) )

  console.log( 'Successfully imported tables lines, shabads'.success )
  return sourceData.reduce( ( acc, data, index ) => ( {
    ...acc,
    [ sourceNames[ index ] ]: data,
  } ), {} )
}

/**
 * Imports tables banis and bani_lines.
 * @param {Object} trx The transaction to use when executing any queries.
 */
const importBanis = async trx => {
  console.log( '\nImporting tables banis, bani_lines'.subheader )

  await Promise.all( require( `${JSON_PATH}/banis` )
    .map( async ( { lines, ...rest }, baniIndex ) => {
      console.log( `Processing bani ${rest.name_english}` )

      // Insert the bani
      await trx.insert( { ...rest, id: baniIndex + 1 } ).into( 'banis' )

      // And figure out the lines it contains
      await Promise.all( lines.map( async ( { start_line: start, end_line: end }, groupIndex ) => {
        // Calculate lines that need to be inserted for bani from ranges
        const baniLines = await trx
          .with( 'order_ids', qb => (
            qb
              .select( [ 'l1.order_id as start_order_id', 'l2.order_id as end_order_id' ] )
              .from( { l1: 'lines', l2: 'lines' } )
              .where( 'l1.id', start )
              .andWhere( 'l2.id', end )
          ) )
          .select( 'id as line_id' )
          .from( { lines: 'lines', order_ids: 'order_ids' } )
          .whereRaw( 'lines.order_id between start_order_id and end_order_id' )

        // Insert lines for banis into bani_lines
        await Promise.all( (
          map( baniLines, line => trx.insert( {
            ...line,
            bani_id: baniIndex + 1,
            line_group: groupIndex + 1,
          } ).into( 'bani_lines' ) )
        ) )
      } ) )
    } ) )

  console.log( 'Successfully imported tables banis, bani_lines'.success )
}

/**
 * Sets up SQLite pragma settings.
 */
const setSQLiteSettings = async () => {
  await knex.raw( 'PRAGMA synchronous = "OFF"' )
  await knex.raw( 'PRAGMA journal_mode = "OFF"' )
  await knex.raw( 'PRAGMA cache_size = 100000' )
}

const main = async () => {
  // Disable knex warnings, nasty monkey patch lol, waiting for resolution in knex
  const { log } = console
  console.log = ( value, ...params ) => ( typeof value !== 'string' || value.indexOf( 'Knex:warning' ) === -1 ? log( value, ...params ) : undefined )

  console.log( 'Generating SQLite database'.header )

  // Create directory for DB file
  await removeDirAsync( OUTPUT_PATH )
  createDir( OUTPUT_PATH )

  // Create tables from schema in a transaction
  await initialiseDatabase()
  await setSQLiteSettings()
  await transaction( knex, async trx => {
    await importSimpleTables( trx )
    await importSources( trx )
    await importTranslationSources( trx )
    await importLines( trx )
    await importBanis( trx )
  } )

  console.log( '\nSuccessfully generated SQLite database'.success.bold )
}

main()
  .then( () => process.exit( 0 ) )
  .catch( async e => {
    console.error( e.message.error )
    console.error( e )
    console.error( '\nFailed to generate SQLite database'.error.bold )
    process.exit( 1 )
  } )
