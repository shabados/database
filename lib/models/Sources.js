/**
 * Objection Model for Sources.
 * @ignore
 */

const { Model } = require( 'objection' )

class Sources extends Model {
  static get tableName() {
    return 'Sources'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Sources.id',
          to: 'Shabads.source_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' )
      },
    }
  }
}

export default Sources
