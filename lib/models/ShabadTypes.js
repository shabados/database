/**
 * Objection Model for Shabad Types.
 * @ignore
 */

const { Model } = require( 'objection' )

class ShabadTypes extends Model {
  static get tableName() {
    return 'Shabad_Types'
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

export default ShabadTypes
