/**
 * General utility functions
 */

const { promisify } = require( 'util' )
const { writeFile, existsSync, mkdirSync } = require( 'fs' )
const { basename } = require( 'path' )


// Wraps writeFile in a promise
const writeFileAsync = promisify( writeFile )

// Removes .json from the end of a given path
const stripExtension = name => basename( name, '.json' )

// Creates a directory if it doesn't already exist
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
 * @returns {string} The first letters
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
  [ /m \d | mhlw \d | hlI bwc | kbIr jI| bwc ]$/, '' ],
  [ / CMd ]/, match => ( source === 'D' ? '' : match ) ],
]
  .reduce( ( result, [ exp, sub ] ) => result.replace( exp, sub ), gurmukhi )
  .split( ' ' )
  .map( ( [ firstLetter, secondLetter ] ) => ( ( {
    i: secondLetter,
    E: 'a',
    S: 's',
    z: 'j',
    Z: 'g',
    L: 'l',
    '^': 'K',
    '&': 'P',
  } )[ firstLetter ] || firstLetter === ']' ? '' : firstLetter ) )
  .join( '' )
  .replace( /^.$/, '' )

module.exports = { writeFileAsync, stripExtension, createDir, generateFirstLetters }
