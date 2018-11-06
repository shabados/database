/**
 * Objection Model for Subsections.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Subsections extends BaseModel {
  static get tableName() {
    return 'Subsections'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Subsections.id',
          to: 'Shabads.subsection_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' )
      },
      section: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'Subsections.section_id',
          to: 'Sections.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sections' )
      },
    }
  }
}

module.exports = Subsections
