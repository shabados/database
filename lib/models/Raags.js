/**
 * Objection Model for Raags.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Raags extends BaseModel {
  static get tableName() {
    return 'Raags'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Raags.id',
          to: 'Shabads.raag_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' )
      },
    }
  }
}

module.exports = Raags
