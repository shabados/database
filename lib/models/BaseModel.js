/**
 * Base Objection Model.
 * @ignore
 */

const { Model, snakeCaseMappers } = require( 'objection' )

class BaseModel extends Model {
  // To avoid too many SQL variables error
  static get defaultEagerAlgorithm() {
    return Model.JoinEagerAlgorithm
  }

  static get useLimitInFirst() {
    return true
  }

  static get columnNameMappers() {
    return snakeCaseMappers()
  }
}

module.exports = BaseModel
