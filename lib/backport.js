/**
 * Backports to 4.x releases.
 * Maps:
 * lines -> first gurmukhi key: gurmukhi
 * drop current sources.json
 * compositions.json -> sources.json
 */

/* eslint-disable global-require, import/no-dynamic-require */

const { unlink, rename, readdir, readFile, writeFile } = require( 'fs/promises' )
const { resolve } = require('path')

const colors = require( './string-colors' )

const JSON_PATH = resolve( __dirname, '../data' )

const GURMUKHI_SOURCES = {
  'Ardaas': 'SGPC',
  'Ganj Nama Bhai Nand Lal Ji': 'Dr. Ganda Singh',
  'Ghazals Bhai Nand Lal Ji': 'Dr. Ganda Singh',
  'Jot Bigas Bhai Nand Lal Ji': 'Dr. Ganda Singh',
  'Kabit Savaiye Bhai Gurdas Ji': 'Seva Singh',
  'Sarabloh Granth': 'Amrit Keertan',
  'Sri Dasam Granth': 'SGPC',
  'Sri Guru Granth Sahib Ji': 'SGPC',
  'Vaaran Bhai Gurdas Ji': 'SGPC',
  'Zindagi Nama Bhai Nand Lal Ji':'Dr. Ganda Singh',
}

const readJson = path => readFile( path ).then( JSON.parse )
const writeJson = ( data, path ) => writeFile( path, `${JSON.stringify( data, null, 2 )}\n` )

const backportLines = async () => {
  console.log( '\nBackporting lines'.subheader )

  // Read compositions
  const compositions = ( await readdir( `${JSON_PATH}`, { withFileTypes: true } ) )
    .filter( result => result.isDirectory() )
    .map( ( { name } ) => name )

  // Iterate over each
  await Promise.all( compositions.map( async composition => {
    const compositionFolder = resolve(JSON_PATH, composition )
    
    // Set the preferred gurmukhi source
    const preferredSource = GURMUKHI_SOURCES[ composition ]

    if ( !preferredSource ) {
      console.error( `No preferred source found for ${composition}` )
      return
    }

    console.log( `Setting the preferred source of ${composition} to ${preferredSource}` )

    // Read data files for that composition
    const compositionFiles = await readdir( compositionFolder )

    await Promise.all( compositionFiles.map( async fileName => {
      const filePath = resolve( compositionFolder, fileName )

      // Read the data file
      const content = await readJson( filePath )

      // Modify content to map preferred gurmukhi source to gumukhi field
      content.forEach( ( { lines } ) => lines.forEach( ( line, index ) => {
        // Reorder the properties
        lines[ index ] = {
          id: line.id,
          source_page: line.source_page,
          source_line: line.source_line,
          gurmukhi: line.gurmukhi[ preferredSource ],
          pronunciation: line.pronunciation,
          pronunciation_information: line.pronunciation_information,
          type: line.type,
          translations: line.translations,
        }
      } ) )

      await writeJson( content, filePath )
    } ) )
  } ) )

  console.log( 'Successfully backported gurmukhi lines'.success )
}

const backportSources = async () => {
  console.log('\nMoving sources.json -> compositions.json'.header)

  await unlink(`${JSON_PATH}/sources.json`)
  await rename(`${JSON_PATH}/compositions.json`, `${JSON_PATH}/sources.json`)
}

const main = async () => {
  console.log( `Backporting database`.header )

  // await backportSources()
  await backportLines()

  console.log( `\nSuccessfully backported database`.success.bold )
}

const run = () => main()
.then( () => process.exit( 0 ) )
.catch( async e => {
  console.error( e.message.error )
  console.error( e )
  console.error( '\nFailed to backport database'.error.bold )
  process.exit( 1 )
} )

if (require.main === module) run()

module.exports = run