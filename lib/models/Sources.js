/**
 * Objection Model for Sources.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Sources extends BaseModel {
  static get tableName() {
    return 'sources'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        join: {
          from: 'sources.id',
          to: 'shabads.source_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' ),
      },
      translationSources: {
        relation: Model.HasManyRelation,
        join: {
          from: 'sources.id',
          to: 'translation_sources.source_id',
        },
        // eslint-disable-next-line
        modelClass: require( './TranslationSources' ),
      },
      sections: {
        relation: Model.HasManyRelation,
        join: {
          from: 'sources.id',
          to: 'sections.source_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sections' ),
      },
    }
  }
}

module.exports = Sources
