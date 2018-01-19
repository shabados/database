/**
 * Objection Model for Writers.
 * @ignore
 */

const { Model } = require( 'objection' )

class Writers extends Model {
  static get tableName() {
    return 'Writers'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        // eslint-disable-next-line
        modelClass: require( './Shabads' )
      },
    }
  }
}

export default Writers
