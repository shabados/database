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
        join: {
          from: 'Writers.id',
          to: 'Shabads.writer_id',
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

module.exports = Writers
