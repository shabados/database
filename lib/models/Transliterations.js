/**
 * Objection Model for Transliterations.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Transliterations extends BaseModel {
  static get tableName() {
    return 'transliterations'
  }

  static get idColumn() {
    return [ 'line_id', 'language_id', 'source_id' ]
  }

  static get relationMappings() {
    return {
      line: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'transliterations.line_id',
          to: 'lines.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
      language: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'transliterations.language_id',
          to: 'languages.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Languages' ),
      },
      source: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'transliterations.source_id',
          to: 'sources.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sources' ),
      },
    }
  }
}

module.exports = Transliterations
