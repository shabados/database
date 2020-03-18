/**
 * Objection Model for Sources.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Compositions extends BaseModel {
  static get tableName() {
    return 'compositions'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        join: {
          from: 'compositions.id',
          to: 'shabads.composition_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' ),
      },
      translationSources: {
        relation: Model.HasManyRelation,
        join: {
          from: 'compositions.id',
          to: 'translation_sources.composition_id',
        },
        // eslint-disable-next-line
        modelClass: require( './TranslationSources' ),
      },
      sections: {
        relation: Model.HasManyRelation,
        join: {
          from: 'compositions.id',
          to: 'sections.composition_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sections' ),
      },
    }
  }
}

module.exports = Compositions
