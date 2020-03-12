/**
 * Objection Model for Variants.
 * @ignore
 */

const BaseModel = require( './BaseModel' )

class Publications extends BaseModel {
  static get tableName() {
    return 'publications'
  }
}

module.exports = Publications
