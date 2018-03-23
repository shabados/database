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
        join: {
          from: 'Shabad_Types.id',
          to: 'Shabads.type_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' )
      },
    }
  }

  static get useLimitInFirst() {
    return true
  }
}

module.exports = ShabadTypes
