/**
 * Generates an SQLite DB from the JSON sources in `data/`.
 */

/* eslint-disable global-require, import/no-dynamic-require */

const camelcaseKeys = require( 'camelcase-keys' )
const { transaction } = require( 'objection' )
const { readdirSync, existsSync } = require( 'fs' )

const colors = require( './string-colors' )
const { createDir, removeDirAsync, findIndex } = require( './utils' )
const createSchema = require( './schema' )
const { knex, Sources, Writers, LineTypes, Languages, Shabads, Sections, Subsections, TranslationSources } = require( '../' )

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
const findTranslationSourceIndex = ( sourceT, languageT, translationSourceT ) => {
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
}

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

      const data = require( `${JSON_PATH}/${name}` )

      await Promise.all( data.map( ( element, index ) => (
        model
          .query( trx )
          .insert( { ...element, id: index + 1 } )
      ) ) )

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

  // Load data and add correct id in order
  const data = require( `${JSON_PATH}/sources` )
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

  console.log( 'Successfully imported tables sources, sections, subsections'.success )
}

/**
 * Imports translation sources.
 * @param {Object} trx The transaction to use when executing any queries.
 */
const importTranslationSources = async trx => {
  console.log( '\nImporting table translation_sources'.subheader )

  await Promise.all( (
    require( `${JSON_PATH}/translation_sources.json` )
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
  let lineId = 1

  await Promise.all( (
    sourceNames.map( async ( sourceName, sourceIndex ) => {
      console.log( `Processing source ${sourceName}` )

      const sourceDir = `./data/${sourceName}`

      if ( !existsSync( sourceDir ) ) { return }

      // Infer from position in array
      const sourceId = sourceIndex + 1

      await Promise.all( (
        readdirSync( sourceDir )
        // Load and concatenate all the shabad files for the source
          .reduce( ( acc, path ) => [
            ...acc,
            ...require( `${JSON_PATH}/${sourceName}/${path}` ),
          ], [] )
        // Resolve any properties
          .map( ( { writer, section, subsection, lines, ...rest }, index ) => ( {
            ...rest,
            orderId: index + 1,
            sourceId,
            writerId: findIndex( writer, writerNames ) + 1,
            sectionId: findIndex( section, sectionNames ) + 1,
            subsectionId: subsection && findIndex( subsection, subsectionNames ) + 1, // Nullable
            // Convert lines to format API can take for insertion
            lines: lines.map( ( { translations, lineType, ...rest } ) => ( {
              ...rest,
              orderId: lineId++, // eslint-disable-line
              lineType: lineType && findIndex( lineType, lineTypeNames ), // Nullable
              // Resolve translationId for the line from the translation source and language keys
              translations: Object
                .entries( translations )
                .reduce( ( acc, [ languageName, translations ] ) => [
                  ...acc,
                  ...Object
                    .entries( translations )
                    .reduce( ( acc, [ translationSourceName, translation ] ) => [
                      ...acc,
                      {
                        translationSourceId: findTranslationSourceIndex(
                          sourceName,
                          languageName,
                          translationSourceName,
                        ) + 1,
                        ...translation,
                        additionalInformation: JSON.stringify( translation.additional_information ),
                      },
                    ], [] ),
                ], [] ),
            } ) ),
          } ) )
          // Insert each shabad one by one, with all the lines and translations attached
          .map( shabad => Shabads.query( trx ).insertGraph( shabad ) )
      ) )
    } )
  ) )

  console.log( 'Successfully imported tables lines, shabads, translations'.success )
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
        await Promise.all( baniLines.map( line => trx.insert( {
          ...line,
          bani_id: baniIndex + 1,
          line_group: groupIndex + 1,
        } ).into( 'bani_lines' ) ) )
      } ) )
    } ) )

  console.log( 'Successfully imported tables banis, bani_lines'.success )
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
