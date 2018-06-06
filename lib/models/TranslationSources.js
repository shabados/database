/**
 * Objection Model for Translation Sources.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class TranslationSources extends BaseModel {
  static get tableName() {
    return 'Translation_Sources'
  }

  static get relationMappings() {
    return {
      source: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'Translation_Sources.source_id',
          to: 'Sources.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sources' ),
      },
      translations: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Translation_Sources.id',
          to: 'Translations.translation_source_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Translations' ),
      },
      language: {
        relation: Model.HasOneRelation,
        join: {
          from: 'Translation_Sources.language_id',
          to: 'Languages.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Languages' ),
      },
    }
  }
}

module.exports = TranslationSources
