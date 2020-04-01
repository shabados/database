/**
 * Objection Model for Transliterations.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class LineContent extends BaseModel {
  static get tableName() {
    return 'line_content'
  }

  static get idColumn() {
    return [ 'line_id', 'source_id' ]
  }

  static get relationMappings() {
    return {
      line: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'line_content.line_id',
          to: 'lines.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
      source: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'line_content.source_id',
          to: 'sources.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sources' ),
      },
      transliterations: {
        relation: Model.HasManyRelation,
        join: {
          from: [ 'line_content.line_id', 'line_content.source_id' ],
          to: [ 'transliterations.line_id', 'transliterations.source_id' ],
        },
        // eslint-disable-next-line
        modelClass: require( './Transliterations' ),
      },
    }
  }
}

module.exports = LineContent
