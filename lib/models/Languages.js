/**
 * Objection Model for Languages.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Languages extends BaseModel {
  static get tableName() {
    return 'Languages'
  }

  static get relationMappings() {
    return {
      translationSources: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Languages.id',
          to: 'Translation_Source.language_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
    }
  }
}

module.exports = Languages
