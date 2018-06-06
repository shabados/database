/**
 * Objection Model for Sections.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Sections extends BaseModel {
  static get tableName() {
    return 'Sections'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Sections.id',
          to: 'Shabads.section_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' ),
      },
      subsections: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Sections.subsection_id',
          to: 'Subsections.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Subsections' ),
      },
    }
  }
}

module.exports = Sections
