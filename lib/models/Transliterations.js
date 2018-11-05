/**
 * Objection Model for Transliterations.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Transliterations extends BaseModel {
  static get tableName() {
    return 'Transliterations'
  }

  static get idColumn() {
    return [ 'line_id', 'language_id' ]
  }

  static get relationMappings() {
    return {
      line: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'Transliterations.line_id',
          to: 'Lines.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
      language: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'Transliterations.language_id',
          to: 'Languages.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Languages' ),
      },
    }
  }
}

module.exports = Transliterations
