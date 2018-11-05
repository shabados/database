/**
 * Objection Model for Translations.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Translations extends BaseModel {
  static get tableName() {
    return 'Translations'
  }

  static get idColumn() {
    return [ 'line_id', 'translation_source_id' ]
  }

  static get relationMappings() {
    return {
      line: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'Translations.line_id',
          to: 'Lines.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
      translationSource: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'Translations.translation_source_id',
          to: 'Translation_Sources.id',
        },
        // eslint-disable-next-line
        modelClass: require( './TranslationSources' ),
      },
    }
  }
}

module.exports = Translations
