/**
 * Base Objection Model.
 * @ignore
 */

const { Model, snakeCaseMappers } = require( 'objection' )

class BaseModel extends Model {
  static get useLimitInFirst() {
    return true
  }

  static get columnNameMappers() {
    return snakeCaseMappers()
  }
}

module.exports = BaseModel
