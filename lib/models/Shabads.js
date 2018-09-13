/**
 * Objection Model for Shabads.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )
const CommonQueryBuilderFactory = require( './CommonQueryBuilder' )

class Shabads extends BaseModel {
  static get tableName() {
    return 'Shabads'
  }

  static get QueryBuilder() {
    return CommonQueryBuilderFactory( 'lines' )
  }

  static get relationMappings() {
    return {
      writer: {
        relation: Model.HasOneRelation,
        join: {
          from: 'Shabads.writer_id',
          to: 'Writers.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Writers' ),
      },
      section: {
        relation: Model.HasOneRelation,
        join: {
          from: 'Shabads.section_id',
          to: 'Sections.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sections' ),
      },
      subsection: {
        relation: Model.HasOneRelation,
        join: {
          from: 'Shabads.subsection_id',
          to: 'Subsections.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Subsections' ),
      },
      source: {
        relation: Model.HasOneRelation,
        join: {
          from: 'Shabads.source_id',
          to: 'Sources.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sources' ),
      },
      lines: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Shabads.id',
          to: 'Lines.shabad_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
    }
  }
}

module.exports = Shabads
