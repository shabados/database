/**
 * Objection Model for Line Types.
 * @ignore
 */

const BaseModel = require( './BaseModel' )

class LineTypes extends BaseModel {
  static get tableName() {
    return 'line_types'
  }
}

module.exports = LineTypes
