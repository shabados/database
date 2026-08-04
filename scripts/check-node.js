#!/usr/bin/env node
// Simple preinstall helper to warn about Node versions known to cause native build issues
const semver = process.versions.node.split('.')
const major = parseInt( semver[0], 10 )

if ( Number.isNaN( major ) ) {
  console.warn( 'Could not determine Node.js major version.' )
  process.exit( 0 )
}

if ( major < 16 || major >= 18 ) {
  console.warn( `\nWarning: This project is tested with Node 16.x. Detected Node ${process.versions.node}.` )
  console.warn( 'If you encounter native build failures (sqlite3), use nvm to switch to Node 16: `nvm install 16 && nvm use 16`\n' )
}

process.exit( 0 )
