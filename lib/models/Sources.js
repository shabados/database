/**
 * Objection Model for Variants.
 * @ignore
 */

const BaseModel = require( './BaseModel' )

class Sources extends BaseModel {
  static get tableName() {
    return 'sources'
  }
}

module.exports = Sources
