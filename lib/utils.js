/**
 * General utility functions
 */

const { promisify } = require( 'util' )
const { writeFile, existsSync, mkdirSync } = require( 'fs' )
const { basename } = require( 'path' )

const { anyid } = require( 'anyid' )

const unicodeMappings = require( './mappings' )

// Wraps writeFile in a promise
const writeFileAsync = promisify( writeFile )

/**
 * Random generates an id using a scheme of A-Z 0-9, excluding I and O.
 * @param {Number} length
 */
const generateId = length => anyid()
  .encode( '0A-IO' )
  .length( length )
  .random()
  .id()

/**
 * Pretty-stringifies and saves json to path, with a newline at the end.
 * @param {text} path The path to write the json file to
 * @param {Object} json The JS object to be serialised
 */
const writeJSON = ( path, json ) => writeFileAsync(
  path,
  `${JSON.stringify( json, null, 2 )}\n`,
  { flag: 'w' },
)

/**
 * Removes the .json extension from the given path.
 * @param {String} name The pathname to remove the extension from
 */
const stripExtension = name => basename( name, '.json' )

/**
 * Creates a directory at path if it doesn't already exist.
 * @param {String} path The directory path
 */
const createDir = path => {
  if ( !existsSync( path ) ) {
    mkdirSync( path )
  }
}

/**
 * Generates a string of the first letters in a line.
 * Removes common strings, then maps each individual word to a letter.
 * First letters are returned if the first letters string > 1.
 * @param {Number} sourceId The source of the line, from `sources.json`
 * @param {String} gurmukhi The line
 */
const generateFirstLetters = ( sourceId, { gurmukhi } ) => [
  [ /] ([੦੧੨੩੪੫੬੭੮੯]*) ॥/, '॥$1॥' ],
  [ /॥ ਰਹਾੳੁ ॥/, '॥ ॥' ],
  [ /॥ ਰਹਾੳੁ ਦੂਜਾ ॥/, '॥ ॥' ],
  [ /॥ ਸੁਧੁ/, '॥' ],
  [ /॥ ਜੁਮਲਾ/, '॥' ],
  [ /॥ ਬਾੲੀਸ ਚੳੁਪਦੇ ਤਥਾ ਪੰਚਪਦੇ/, '॥' ],
  [ /॥ ਛਕਾ ੧/, '॥' ],
  [ /॥ ਛਕਾ ੨/, '॥' ],
  [ /॥ ਛਕਾ ੩/, '॥' ],
  [ /॥ ਜੋੜੁ/, '॥' ],
  [ /^ਅਾਸਾ ॥ ਤਿਪਦਾ ॥ ੲਿਕਤੁਕਾ ॥$/, '' ],
  [ /^ਕਬੀਰੁ ॥ ਮਾਰੂ ॥$/, '' ],
  [ /^ਮੁਖ ਭਾਗ$/, '' ],
  [ /.*ਮ [੦੧੨੩੪੫੬੭੮੯].*|.*ਮਹਲਾ [੦੧੨੩੪੫੬੭੮੯].*|.*ਹਲੀ ਬਾਚ.*|.*ਕਬੀਰ ਜੀ.*|.*ਬਾਚ ॥.*/, '' ],
  // eslint-disable-next-line
  [/.*ਛੰਦ ॥.*/, match => ( sourceId == 2 ? '' : match )],
]
  .reduce( ( result, [ exp, sub ] ) => result.replace( exp, sub ), gurmukhi )
  .split( ' ' )
  .map( ( [ firstLetter, secondLetter ] ) => {
    const replacements = {
      'ਿ': secondLetter || '',
      ਓ: 'ੳ',
      ਸ਼: 'ਸ',
      ਜ਼: 'ਜ',
      ਗ਼: 'ਗ',
      ਲ਼: 'ਲ',
      ਖ਼: 'ਖ',
      ਫ਼: 'ਫ',
      '॥': '',
      '।': '',
    }

    // Return the replacement if there was one, otherwise the first letter
    return replacements[ firstLetter ] !== undefined ? replacements[ firstLetter ] : firstLetter
  } )
  .join( '' )
  .replace( /^.$/, '' )

/**
 * Converts ASCII text used in the GurmukhiAkhar font to Unicode.
 * @param {String} text The ascii text to convert
 */
const akharToUnicode = text => text
  .replace( /i./g, match => match.split( '' ).reverse().join( '' ) )
  .split( '' )
  .map( c => ( unicodeMappings[ c ] !== undefined ? unicodeMappings[ c ] : c ) )
  .join( '' )
  .replace( /ਿ੍./g, match => match.slice( 1, 3 ).concat( 'ਿ' ) )

module.exports = {
  writeJSON,
  stripExtension,
  createDir,
  generateId,
  generateFirstLetters,
  akharToUnicode,
}
