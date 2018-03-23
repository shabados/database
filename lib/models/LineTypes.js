/**
 * Objection Model for Line Types.
 * @ignore
 */

const { Model } = require( 'objection' )

class LineTypes extends Model {
  static get tableName() {
    return 'Line_Types'
  }

  static get useLimitInFirst() {
    return true
  }
}

module.exports = LineTypes
