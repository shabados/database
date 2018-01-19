/**
 * Objection Model for Raags.
 * @ignore
 */

const { Model } = require( 'objection' )

class Raags extends Model {
  static get tableName() {
    return 'Raags'
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

export default Raags
