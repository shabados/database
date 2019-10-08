/**
 * Objection Model for Translations.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Translations extends BaseModel {
  static get tableName() {
    return 'translations'
  }

  static get idColumn() {
    return [ 'line_id', 'translation_source_id' ]
  }

  static get relationMappings() {
    return {
      line: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'translations.line_id',
          to: 'lines.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
      translationSource: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'translations.translation_source_id',
          to: 'translation_sources.id',
        },
        // eslint-disable-next-line
        modelClass: require( './TranslationSources' ),
      },
    }
  }
}

module.exports = Translations
