/**
 * Objection Model for Shabads.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )
const CommonQueryBuilderFactory = require( './CommonQueryBuilder' )
const Lines = require( './Lines' )

class ShabadQueryBuilder extends CommonQueryBuilderFactory( 'lines' ) {
  static getLineIds( shabad ) {
    return Lines
      .query()
      .select( 'id' )
      .where( 'shabad_id', shabad.id )
  }

  withTranslations( ...params ) {
    return super.appendTranslations( ShabadQueryBuilder.getLineIds, ...params )
  }

  withTransliterations( ...params ) {
    return super.appendTransliterations( ShabadQueryBuilder.getLineIds, ...params )
  }
}

class Shabads extends BaseModel {
  static get tableName() {
    return 'shabads'
  }

  static get QueryBuilder() {
    return ShabadQueryBuilder
  }

  static get relationMappings() {
    return {
      writer: {
        relation: Model.HasOneRelation,
        join: {
          from: 'shabads.writer_id',
          to: 'writers.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Writers' ),
      },
      section: {
        relation: Model.HasOneRelation,
        join: {
          from: 'shabads.section_id',
          to: 'sections.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Sections' ),
      },
      subsection: {
        relation: Model.HasOneRelation,
        join: {
          from: 'shabads.subsection_id',
          to: 'subsections.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Subsections' ),
      },
      composition: {
        relation: Model.HasOneRelation,
        join: {
          from: 'shabads.composition_id',
          to: 'composition.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Compositions' ),
      },
      lines: {
        relation: Model.HasManyRelation,
        join: {
          from: 'shabads.id',
          to: 'lines.shabad_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
    }
  }
}

module.exports = Shabads
