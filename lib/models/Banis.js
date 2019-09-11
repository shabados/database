/**
 * Objection Model for Banis.
 * @ignore
 */

const { Model } = require( 'objection' )

const BaseModel = require( './BaseModel' )
const CommonQueryBuilderFactory = require( './CommonQueryBuilder' )

class Banis extends BaseModel {
  static get tableName() {
    return 'banis'
  }

  static get QueryBuilder() {
    return CommonQueryBuilderFactory( 'lines' )
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
          },
          to: 'Lines.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Lines' ),
      },
    }
  }
}

module.exports = Banis
