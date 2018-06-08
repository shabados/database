/**
 * Generates JSON sources from database in `build/database.sqlite`.
 */

const { renameSync } = require( 'fs' )
const { groupBy } = require( 'lodash' )
const snakeCaseKeys = require( 'snakecase-keys' )
const knex = require( 'knex' )( require( '../knexfile' ) )

const colors = require( './string-colors' )
const { createDir, removeDirAsync, writeJSON, akharToUnicode } = require( './utils' )
const { Sources, TranslationSources } = require( '../' )

const OUTPUT_DIR = './seeds'
const TMP_DIR = './seeds.tmp'

/**
 * Retrieves data from a table, ordered by its id.
 * @param {String} tableName
 */
const getTable = async tableName => knex( tableName ).select().orderBy( 'id' )

/**
 * Saves data as JSON, with messages, into the output directory.
 * @param {String} filename The filename to save the JSON as.
 * @param {Object} data The JSON to save.
 * @param {Boolean} [output] Whether to show console output.
 */
const saveData = async ( filename, data, output = true ) => {
  const path = `${TMP_DIR}/${filename}.json`
  await writeJSON( path, data )
  if ( output ) { console.log( `Saved ${path}`.success ) }
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

      // Order by Lines.order_id to provide start and end lines for each line group
      const lines = ( await knex
        .with( 'bani_lines_ordered', qb => (
          qb
            .select()
            .from( 'bani_lines' )
            .join( 'lines', 'lines.id', 'bani_lines.line_id' )
            .where( 'bani_id', baniId )
            .orderBy( 'lines.order_id' )
        ) )
        .with( 'bani_ranges', qb => (
          qb
            .min( 'order_id as min_order_id' )
            .max( 'order_id as max_order_id' )
            .from( 'bani_lines_ordered' )
            .groupBy( 'line_group' )
        ) )
        .select( [ 'l1.id as start_line', 'l2.id as end_line' ] )
        .from( 'bani_ranges' )
        .join( 'bani_lines_ordered as l1', 'l1.order_id', 'min_order_id' )
        .join( 'bani_lines_ordered as l2', 'l2.order_id', 'max_order_id' )
        .groupBy( 'l1.line_group' ) )

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

  return Sources
    .query()
    .eager( 'shabads.[writer, section, subsection]' )
    .then( sources => sources.reduce( async ( acc, { shabads, nameEnglish } ) => ( {
      // Group shabads by source
      ...( await acc ),
      [ nameEnglish ]: await Promise.all( shabads.map( async shabad => ( {
      // Generate JSON with desired keys for Shabad
        ...snakeCaseKeys( {
          ...shabad,
          writerId: undefined,
          sourceId: undefined,
          sectionId: undefined,
          subsectionId: undefined,
          writer: shabad.writer.nameEnglish,
          section: shabad.section.nameEnglish,
          subsection: ( shabad.subsection && shabad.subsection.nameEnglish ) || null, // Nullable
        } ),
        // Generate JSON for lines for that shabad with desired keys
        lines: ( await shabad.$relatedQuery( 'lines' ).eager( '[type, translations.translationSource.language]' ) )
          .map( ( { orderId, firstLetters, typeId, shabadId, translations, ...line } ) => ( {
            ...snakeCaseKeys( line ),
            // Generate JSON for translations for line organised by language: { source: data }
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
            } ), Promise.resolve( {} ) ),
          } ) ),
      } ) ) ),
    } ), {} ) )
    .then( sources => Object.entries( sources ).reduce( ( acc, [ sourceName, shabads ] ) => ( {
      ...acc,
      [ sourceName ]: groupBy( shabads, ( { lines: [ first ] } ) => first.source_page ),
    } ), {} ) )
    .then( sources => Object.entries( sources ).forEach( ( [ source, pages ] ) => {
      console.log( `Compiling shabads for ${source}` )

      createDir( `${TMP_DIR}/${source}` )
      Object.entries( pages ).forEach( ( [ page, shabads ] ) => saveData( `${source}/${page}`, shabads, false ) )
    } ) )
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
    } ) => console.log( `Compiling ${rest.nameEnglish} - ${languageName} for ${sourceName}` ) || ( {
      ...rest,
      source: sourceName,
      language: languageName,
    } ) ) )
    .then( data => (
      Object // Flatten the object of objects back into an array after changing into snake_case
        .entries( snakeCaseKeys( data ) )
        .reduce( ( final, [ , object ] ) => [ ...final, object ], [] )
    ) )
    .then( data => saveData( 'translation_sources', data ) )
}

/**
 * Stores all the list-y, simple tables in their own JSON files.
 */
const processSimpleTables = async () => {
  const simpleTables = [ 'writers', 'languages', 'line_types' ]

  ;( await Promise.all( simpleTables.map( async name => {
    console.log( `Processing ${name}`.subheader )

    return [ name, await getTable( name ) ]
  } ) ) )
    // Extract everything but id
    .map( ( [ name, data ] ) => [ name, data.map( ( { id, ...data } ) => data ) ] )
    .forEach( ( [ name, data ] ) => saveData( name, data ) )
}

/**
 * Runs all the generation functions.
 */
const main = async () => {
  console.log( 'Generating JSON sources'.header )

  // Work in temp folder
  await removeDirAsync( TMP_DIR )
  createDir( TMP_DIR )

  // Run extraction
  await processSimpleTables()
  await processBanis()
  await processSources()
  await processTranslationSources()
  await processLines()

  // Move tmp folder to output folder
  console.log( '\nMoving seeds.tmp to seeds'.subheader )
  await removeDirAsync( OUTPUT_DIR )
  renameSync( TMP_DIR, OUTPUT_DIR )

  console.log( '\nSuccessfully generated JSON sources'.success.bold )
}

main()
  .then( () => process.exit( 0 ) )
  .catch( async e => {
    await removeDirAsync( TMP_DIR )
    console.error( e )
    console.log( '\nFailed to generate JSON sources'.error.bold )
    process.exit( 1 )
  } )
