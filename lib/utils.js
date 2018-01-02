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

const generateFirstLetters = ( source, { gurmukhi } ) => {

}

module.exports = { writeFileAsync, stripExtension, createDir, generateFirstLetters }
