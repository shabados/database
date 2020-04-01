/**
 * Objection Model for Banis.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )
const CommonQueryBuilderFactory = require( './CommonQueryBuilder' )

class BaniQueryBuilder extends CommonQueryBuilderFactory( 'lines' ) {
  static getLineIds( bani ) {
    return Model
      .knex()
      .select( 'line_id' )
      .from( 'bani_lines' )
      .where( 'bani_id', bani.id )
  }

  withTranslations( ...params ) {
    return super.appendTranslations( BaniQueryBuilder.getLineIds, ...params )
  }
}

class Banis extends BaseModel {
  static get tableName() {
    return 'banis'
  }

  static get QueryBuilder() {
    return BaniQueryBuilder
  }

  static get relationMappings() {
    return {
      lines: {
        relation: Model.ManyToManyRelation,
        join: {
          from: 'banis.id',
          through: {
            from: 'bani_lines.bani_id',
            to: 'bani_lines.line_id',
            extra: [ 'line_group' ],
          },
          to: 'lines.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
    }
  }
}

module.exports = Banis
