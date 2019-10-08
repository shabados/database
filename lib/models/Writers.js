/**
 * Objection Model for Writers.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Writers extends BaseModel {
  static get tableName() {
    return 'writers'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        join: {
          from: 'writers.id',
          to: 'shabads.writer_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' ),
      },
    }
  }
}

module.exports = Writers
