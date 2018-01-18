/**
 * General utility functions
 */

const { promisify } = require( 'util' )
const { writeFile, existsSync, mkdirSync } = require( 'fs' )
const { basename } = require( 'path' )


// Wraps writeFile in a promise
const writeFileAsync = promisify( writeFile )

/**
 * Pretty-stringifies and saves json to path, with a newline at the end.
 * @param path The path to write the json file to
 * @param json The js object to be serialised
 */
const writeJSON = ( path, json ) => writeFileAsync(
  path,
  `${JSON.stringify( json, null, 2 )}\n`,
  { flag: 'w' },
)

/**
 * Removes the .json extension from the given path.
 * @param name The pathname to remove the extension from
 */
const stripExtension = name => basename( name, '.json' )

/**
 * Creates a directory at path if it doesn't already exist.
 * @param path The directory path
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
 * @param source The source of the line, from `sources.json`
 * @param gurmukhi The line
 */
const generateFirstLetters = ( source, { gurmukhi } ) => [
  [ /] ([0-9]*) ]/, ']$1]' ],
  [ /] rhwau ]/, '] ]' ],
  [ /] rhwau dUjw ]/, '] ]' ],
  [ /] suDu/, ']' ],
  [ /] jumlw/, ']' ],
  [ /] bweIs caupdy qQw pMcpdy/, ']' ],
  [ /] Ckw 1/, ']' ],
  [ /] Cky 2/, ']' ],
  [ /] Cky 3/, ']' ],
  [ /] joVu/, ']' ],
  [ /^Awsw ] iqpdw ] iekqukw ]$/, '' ],
  [ /^kbIru ] mwrU ]$/, '' ],
  [ /^muK Bwg$/, '' ],
  [ /.*m \d.*|.*mhlw \d.*|.*hlI bwc.*|.*kbIr jI.*|.*bwc ].*/, '' ],
  [ /.*CMd ].*/, match => ( source === 'ਸ੍ਰੀ ਦਸਮ ਗ੍ਰੰਥ' ? '' : match ) ],
]
  .reduce( ( result, [ exp, sub ] ) => result.replace( exp, sub ), gurmukhi )
  .split( ' ' )
  .map( ( [ firstLetter, secondLetter ] ) => {
    const replacements = {
      i: secondLetter || '',
      E: 'a',
      S: 's',
      z: 'j',
      Z: 'g',
      L: 'l',
      '^': 'K',
      '&': 'P',
      ']': '',
    }

    // Return the replacement if there was one, otherwise the first letter
    return replacements[ firstLetter ] !== undefined ? replacements[ firstLetter ] : firstLetter
  } )
  .join( '' )
  .replace( /^.$/, '' )

module.exports = { writeJSON, stripExtension, createDir, generateFirstLetters }
