/**
 * Objection Model for Languages.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Languages extends BaseModel {
  static get tableName() {
    return 'languages'
  }

  static get relationMappings() {
    return {
      translationSources: {
        relation: Model.HasManyRelation,
        join: {
          from: 'languages.id',
          to: 'translation_sources.language_id',
        },
        // eslint-disable-next-line
        modelClass: require( './TranslationSources' ),
      },
    }
  }
}

module.exports = Languages
