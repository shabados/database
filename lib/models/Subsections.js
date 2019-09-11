/**
 * Objection Model for Subsections.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Subsections extends BaseModel {
  static get tableName() {
    return 'subsections'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        join: {
          from: 'subsections.id',
          to: 'shabads.subsection_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' )
      },
      section: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'subsections.section_id',
          to: 'sections.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sections' )
      },
    }
  }
}

module.exports = Subsections
