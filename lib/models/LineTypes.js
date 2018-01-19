/**
 * Objection Model for Line Types.
 * @ignore
 */

const { Model } = require( 'objection' )

class LineTypes extends Model {
  static get tableName() {
    return 'Line_Types'
  }
}

module.exports = LineTypes
