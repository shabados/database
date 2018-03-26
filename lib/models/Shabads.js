/**
 * Objection Model for Shabads.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Shabads extends BaseModel {
  static get tableName() {
    return 'Shabads'
  }

  static get relationMappings() {
    return {
      writer: {
        relation: Model.HasOneRelation,
        join: {
          from: 'Shabads.writer_id',
          to: 'Writers.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Writers' )
      },
      raag: {
        relation: Model.HasOneRelation,
        join: {
          from: 'Shabads.raag_id',
          to: 'Raags.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Raags' )
      },
      source: {
        relation: Model.HasOneRelation,
        join: {
          from: 'Shabads.source_id',
          to: 'Sources.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sources' )
      },
      type: {
        relation: Model.HasOneRelation,
        join: {
          from: 'Shabads.type_id',
          to: 'Shabad_Types.id',
        },
        // eslint-disable-next-line
        modelClass: require( './ShabadTypes' )
      },
      lines: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Shabads.id',
          to: 'Lines.shabad_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' )
      },
    }
  }
}

module.exports = Shabads
