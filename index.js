/**
 * Imports all the models and re-exports them with names.
 * @ignore
 */

const Banis = require( './lib/models/Banis' )
const Lines = require( './lib/models/Lines' )
const LineTypes = require( './lib/models/LineTypes' )
const Raags = require( './lib/models/Raags' )
const Shabads = require( './lib/models/Shabads' )
const ShabadTypes = require( './lib/models/ShabadTypes' )
const Sources = require( './lib/models/Sources' )
const Writers = require( './lib/models/Writers' )

module.exports = {
  Banis,
  Lines,
  LineTypes,
  Raags,
  Shabads,
  ShabadTypes,
  Sources,
  Writers,
}
