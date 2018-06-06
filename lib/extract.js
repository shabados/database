/**
 * Generates JSON sources from database in `build/database.sqlite`.
 */

const snakeCaseKeys = require( 'snakecase-keys' )
const knex = require( 'knex' )( require( '../knexfile' ) )

const colors = require( './string-colors' )
const { createDir, writeJSON, akharToUnicode } = require( './utils' )
const { Sources, Shabads, TranslationSources } = require( '../' )

const OUTPUT_DIR = './seeds'

/**
 * Retrieves data from a table, ordered by its id.
 * @param {string} tableName
 */
const getTable = async tableName => knex( tableName ).select().orderBy( 'id' )

/**
 * Saves data as JSON, with messages, into the output directory.
 * @param {string} filename The filename to save the JSON as.
 * @param {*} data The JSON to save.
 */
const saveData = async ( filename, data ) => {
  const path = `${OUTPUT_DIR}/${filename}.json`
  await writeJSON( `${OUTPUT_DIR}/${filename}.json`, data )
  console.log( `Saved ${OUTPUT_DIR}/${filename}.json`.success )
}

/**
 * Combines the banis and bani_lines into a nested structure.
 */
const processBanis = async () => {
  console.log( '\nProcessing banis'.subheader )

  // Generate the ranges for each of the banis, and join into an array
  return getTable( 'banis' )
    .then( banis => banis.reduce( async ( compiled, { id: baniId, ...data } ) => {
      console.log( `Compiling bani ${data.name_english}` )

      const lines = ( await knex( 'bani_lines' )
        .min( 'line_id as start_line' )
        .max( 'line_id as end_line' )
        .where( 'bani_id', baniId )
        .groupBy( 'line_group' ) )

      return [ ...compiled, { ...data, lines } ]
    }, [] ) )
    .then( data => saveData( 'banis', data ) )
}

/**
 * Combines the sources, sections, and subsections into a nested structure.
 */
const processSources = async () => {
  console.log( '\nProcessing sources'.subheader )

  return Sources
    .query()
    .eager( 'sections.[subsections]' )
    .then( sources => sources.map( ( { id, sections, ...rest } ) => (
      console.log( `Compiling source ${rest.nameEnglish}` ) ||
      {
        ...rest,
        sections: sections.map( ( { id, sourceId, subsections, ...rest } ) => ( {
          ...rest,
          subsections: subsections.map( ( { id, sectionId, ...rest } ) => rest ),
        } ) ),
      } ) ) )
    .then( data => (
      Object // Flatten the object of objects back into an array after changing into snake_case
        .entries( snakeCaseKeys( data ) )
        .reduce( ( final, [ , object ] ) => [ ...final, object ], [] )
    ) )
    .then( data => saveData( 'sources', data ) )
}

/**
 * Combines the lines and shabads into a nested structure.
 */
const processLines = async () => {
  console.log( '\nProcessing lines'.subheader )

  return Shabads
    .query()
    .eager( '[source, writer, section, subsection]' )
    .then( shabads => Promise.all( shabads.map( async shabad => ( {
      // Generate JSON with desired keys for Shabad
      // TODO: generate shabad id - separate script for initial
      ...snakeCaseKeys( {
        ...shabad,
        writerId: undefined,
        sourceId: undefined,
        sectionId: undefined,
        subsectionId: undefined,
        writer: shabad.writer.nameEnglish,
        section: shabad.section.nameEnglish,
        subsection: ( shabad.subsection && shabad.subsection.nameEnglish ) || null, // Nullable
        source: shabad.source.nameEnglish,
      } ),
      // Generate JSON for lines for that shabad with desired keys
      lines: ( await shabad.$relatedQuery( 'lines' ).eager( '[type, translations.translationSource.language]' ) )
        .map( ( { orderId, firstLetters, typeId, shabadId, translations, ...line } ) => ( {
          ...snakeCaseKeys( line ),
          // Generate JSON for translations for line organised by languageName: { sourceName: data }
          translations: translations.reduce( ( acc, {
            translationSourceId,
            lineId,
            translationSource: {
              language: { nameEnglish: languageName },
              nameEnglish: translationSourceName,
            },
            ...translation
          } ) => ( {
            ...acc,
            // Group translations by languages
            [ languageName ]: {
              ...acc[ languageName ],
              // And then the actual name of the translation source of the translation
              [ translationSourceName ]: snakeCaseKeys( {
                ...translation,
                // Must deserialise JSON field from DB
                additionalInformation: JSON.parse( translation.additionalInformation ),
              } ),
            },
          } ), {} ),
        } ) ),
    } ) ) ) )
    .then( data => saveData( 'lines', data ) )
}

/**
 * Combines the translation sources and languages into a nested structure.
 */
const processTranslationSources = async () => {
  console.log( '\nProcessing translation sources'.subheader )

  return TranslationSources
    .query()
    .eager( '[language, source]' )
    .then( translationSources => translationSources.map( ( {
      id,
      sourceId,
      languageId,
      language: { nameEnglish: languageName },
      source: { nameEnglish: sourceName },
      ...rest
    } ) => ( {
      ...rest,
      source: sourceName,
      language: languageName,
    } ) ) )
    // .then( data => (
    //   Object // Flatten the object of objects back into an array after changing into snake_case
    //     .entries( snakeCaseKeys( data ) )
    //     .reduce( ( final, [ , object ] ) => [ ...final, object ], [] )
    // ) )
    .then( data => saveData( 'translation_sources', data ) )
}

/**
 * Stores all the list-y, simple tables in their own JSON files.
 */
const processSimpleTables = async () => {
  const simpleTables = [ 'writers', 'languages', 'line_types' ]

  ;( await Promise.all( simpleTables.map( async name => {
    console.log( `Processing ${name}`.subheader )

    return [ `${OUTPUT_DIR}/${name}.json`, await getTable( name ) ]
  } ) ) )
    // Extract everything but id
    .map( ( [ path, data ] ) => [ path, data.map( ( { id, ...data } ) => data ) ] )
    .forEach( ( [ path, data ] ) => {
      // Write it to disk
      writeJSON( path, data )

      console.log( `Saved ${path}`.success )
    } )
}

const main = async () => {
  console.log( 'Generating JSON sources'.header )

  await processSimpleTables()
  await processBanis()
  await processSources()
  await processTranslationSources()
  await processLines()

  console.log( '\nSuccessfully generated JSON sources'.success.bold )
}

main()
  .then( () => process.exit( 0 ) )
  .catch( e => {
    console.error( e )
    console.log( '\nFailed to generate JSON sources'.error.bold )
    process.exit( 1 )
  } )
