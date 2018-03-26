/**
 * Objection Model for Line Types.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class LineTypes extends BaseModel {
  static get tableName() {
    return 'Line_Types'
  }
}

module.exports = LineTypes
