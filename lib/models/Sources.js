/**
 * Objection Model for Sources.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Sources extends BaseModel {
  static get tableName() {
    return 'Sources'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Sources.id',
          to: 'Shabads.source_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' ),
      },
      translationSources: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Sources.id',
          to: 'Translation_Sources.source_id',
        },
        // eslint-disable-next-line
        modelClass: require( './TranslationSources' ),
      },
      sections: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Sources.id',
          to: 'Sections.source_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sections' ),
      },
    }
  }
}

module.exports = Sources
