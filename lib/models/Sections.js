/**
 * Objection Model for Sections.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )

class Sections extends BaseModel {
  static get tableName() {
    return 'sections'
  }

  static get relationMappings() {
    return {
      shabads: {
        relation: Model.HasManyRelation,
        join: {
          from: 'sections.id',
          to: 'shabads.section_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' ),
      },
      subsections: {
        relation: Model.HasManyRelation,
        join: {
          from: 'sections.id',
          to: 'subsections.section_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Subsections' ),
      },
      composition: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'sections.composition_id',
          to: 'compositions.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Compositions' ),
      },
    }
  }
}

module.exports = Sections
