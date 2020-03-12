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
    return [ 'line_id', 'publication_id' ]
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
      publication: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'line_content.publication_id',
          to: 'publications.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Publications' ),
      },
    }
  }
}

module.exports = LineContent
