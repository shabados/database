/**
 * Generates a DB from the JSON compositions in `data/`.
 */

/* eslint-disable global-require, import/no-dynamic-require */

const { readdirSync, existsSync } = require( 'fs' )
const { transaction } = require( 'objection' )
const memoize = require( 'memoizee' )
const { reduce, map, forEach } = require( 'fast.js' )
const { unload } = require( 'freshy' )
const { omit } = require( 'lodash' )
const {
  firstLetters,
  stripEndings,
  stripVishraams,
  stripAccents,
  toEnglish,
  toHindi,
  toShahmukhi,
  toUnicode,
  toAscii,
} = require( 'gurmukhi-utils' )

const colors = require( './string-colors' )
const { findIndex } = require( './utils' )
const createSchema = require( './schema' )
const {
  knex,
  Compositions,
  Writers,
  LineTypes,
  Languages,
  Sections,
  Subsections,
  TranslationSources,
  Sources,
} = require( '..' )

const JSON_PATH = '../data'

/**
 * Maps a list of JSON objects to only return the english name.
 * @param {Object} json The json object to map.
 */
const toEnglishName = json => json.map( ( { name_english: nameEnglish } ) => nameEnglish )

const translationSourcesJSON = require( `${JSON_PATH}/translation_sources` )

// Generate a list of the names, so the index of values can be retrieved
const compositionNames = toEnglishName( require( '../data/compositions' ) )
const languageNames = toEnglishName( require( '../data/languages' ) )
const writerNames = toEnglishName( require( '../data/writers' ) )
const lineTypeNames = toEnglishName( require( '../data/line_types' ) )
const sourceNames = toEnglishName( require( '../data/sources' ) )

const TranslationSourceNames = toEnglishName( translationSourcesJSON )

/**
 * Checks if the line is a Sirlekh.
 * @param {Object} The input line.
 */
const isSirlekh = ( { type_id: typeId } ) => lineTypeNames[ typeId - 1 ] === 'Sirlekh'

/**
 * Returns the transliterations of a given Gurmukhi line.
 * @param gurmukhi The Gurmukhi line to produce transliterations for.
 * @returns An array of [ language_id, transliteration_function ]
 */
const transliterateAll = gurmukhi => [
  [ 'English', toEnglish ],
  [ 'Hindi', toHindi ],
  [ 'Urdu', toShahmukhi ],
].map( ( [ name, fn ] ) => [
  languageNames.findIndex( languageName => languageName === name ) + 1,
  fn( toUnicode( gurmukhi ) ),
] )

/**
 * Finds the index of the translation source provided.
 * @param {String} compositionT The composition of the translation source.
 * @param {String} languageT The language of the translation source.
 * @param {String} translationSourceT The translation source name.
 */
const findTranslationSourceIndex = memoize( ( compositionT, languageT, translationSourceT ) => {
  // Find position of correct translation source
  const index = translationSourcesJSON
    .findIndex( ( { composition, language, name_english: translationSource } ) => (
      composition === compositionT
      && language === languageT
      && translationSource === translationSourceT
    ) )

  // If not found, figure out which properties are incorrect
  if ( index === -1 ) {
    findIndex( compositionT, compositionNames )
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
    [ 'sources', Sources ],
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
 * Imports compositions, their sections, and their subsections.
 * @param {Object} trx The transaction to use when executing any queries.
 */
const importCompositions = async trx => {
  console.log( '\nImporting tables compositions, sections, subsections'.subheader )

  // Need id context across compositions and sections
  let sectionId = 1
  let subsectionId = 1

  const path = `${JSON_PATH}/compositions`

  // Load data and add correct id in order
  const data = require( path )
    .map( ( composition, index ) => ( {
      ...composition,
      id: index + 1,
      sections: composition.sections.map( section => ( {
        ...section,
        id: sectionId++, // eslint-disable-line
        subsections: section.subsections.map( subsection => ( {
          ...subsection,
          id: subsectionId++, // eslint-disable-line
        } ) ),
      } ) ),
    } ) )

  await Compositions.query( trx ).insertGraph( data )

  unload( path )

  console.log( 'Successfully imported tables compositions, sections, subsections'.success )
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
    // Get composition and language ids from string
      .map( ( { composition, language, ...rest }, index ) => {
        console.log( `Processing ${rest.name_english}` )

        return {
          ...rest,
          id: index + 1,
          languageId: findIndex( language, languageNames ) + 1,
          compositionId: findIndex( composition, compositionNames ) + 1,
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

  const compositionData = await Promise.all( (
    compositionNames.map( async ( compositionName, compositionIndex ) => {
      console.log( `Processing composition ${compositionName}` )

      const compositionDir = `./data/${compositionName}`

      if ( !existsSync( compositionDir ) ) { return [] }

      // Load and concatenate all the shabad files for the composition
      const paths = map( readdirSync( compositionDir ), path => `${JSON_PATH}/${compositionName}/${path}` )

      const shabads = reduce( paths, ( acc, path ) => [
        ...acc,
        ...require( path ),
      ], [] )

      // Infer from position in array
      const compositionId = compositionIndex + 1

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
          composition_id: compositionId,
          writer_id: findIndex( writer, writerNames ) + 1,
          section_id: findIndex( section, sectionNames ) + 1,
          subsection_id: subsection && findIndex( subsection, subsectionNames ) + 1, // Nullable
        },
        // [Lines, Translations] is the second element
        map( lines, ( { type, translations, id: lineId, ...rest } ) => ( [
          // First element is lines
          {
            ...rest,
            id: checkLineId( lineId ) || lineId,
            shabad_id: shabadId,
            order_id: lineOrderId++, // eslint-disable-line
            type_id: type && ( findIndex( type, lineTypeNames ) + 1 ), // Nullable
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
                  compositionName,
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
      const lineContentData = []
      const transliterationData = []

      // Pull out the line, translations, and generate transliterations from the structure
      forEach( data, ( [ , lines ] ) => (
        forEach( lines, ( [ line, translations ] ) => {
          const { gurmukhi, id } = line

          // Push lines and translations
          lineData.push( omit( line, 'gurmukhi' ) )
          translationData.push( ...translations )

          // Add each sources's gurmukhi + transliterations
          Object.entries( gurmukhi ).forEach( ( [ sourceName, gurmukhi ] ) => {
            const sourceId = sourceNames.findIndex( nameEnglish => sourceName === nameEnglish ) + 1

            const getFirstLetters = text => ( {
              first_letters: [
                toUnicode,
                ...( isSirlekh( line ) ? [] : [ stripEndings ] ),
                stripAccents,
                stripVishraams,
                firstLetters,
                toAscii,
              ].reduce( ( text, fn ) => fn( text ), text ),
              vishraam_first_letters: [
                toUnicode,
                ...( isSirlekh( line ) ? [] : [ stripEndings ] ),
                stripAccents,
                // Retain heavy vishraams only
                text => stripVishraams( text, { light: true, medium: true } ),
                firstLetters,
                toAscii,
              ].reduce( ( text, fn ) => fn( text ), text ),
            } )

            lineContentData.push( {
              line_id: line.id,
              source_id: sourceId,
              gurmukhi,
              ...getFirstLetters( gurmukhi ),
            } )

            transliterateAll( gurmukhi ).forEach( ( [ languageId, transliteration ] ) => (
              transliterationData.push( {
                line_id: id,
                language_id: languageId,
                source_id: sourceId,
                transliteration,
                ...getFirstLetters( transliteration ),
              } ) ) )
          } )
        } )
      ) )

      // Insert data into all 3 tables
      return Promise.all( [
        trx.batchInsert( 'shabads', shabadData, 140 ),
        trx.batchInsert( 'lines', lineData, 80 ),
        trx.batchInsert( 'line_content', lineContentData, 80 ),
        trx.batchInsert( 'translations', translationData, 115 ),
        trx.batchInsert( 'transliterations', transliterationData, 115 ),
      ] )
    } )
  ) )

  console.log( 'Successfully imported tables lines, shabads'.success )
  return compositionData.reduce( ( acc, data, index ) => ( {
    ...acc,
    [ compositionNames[ index ] ]: data,
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

const main = async ( {
  type = '?',
  beforeInitialise = () => {},
  onInitialise = () => {},
} ) => {
  // Disable knex warnings, nasty monkey patch lol, waiting for resolution in knex
  const { log } = console
  console.log = ( value, ...params ) => ( typeof value !== 'string' || value.indexOf( 'Knex:warning' ) === -1 ? log( value, ...params ) : undefined )

  console.log( `Generating ${type} database`.header )

  await beforeInitialise()

  // Create tables from schema in a transaction
  await initialiseDatabase()
  await onInitialise( knex )
  await transaction( knex, async trx => {
    await importSimpleTables( trx )
    await importCompositions( trx )
    await importTranslationSources( trx )
    await importLines( trx )
    await importBanis( trx )
  } )

  console.log( `\nSuccessfully ${type} generated database`.success.bold )
}

module.exports = params => main( params )
  .then( () => process.exit( 0 ) )
  .catch( async e => {
    console.error( e.message.error )
    console.error( e )
    console.error( '\nFailed to generate database'.error.bold )
    process.exit( 1 )
  } )
