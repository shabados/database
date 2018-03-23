/**
 * Objection Model for Lines, with custom query builder.
 * @ignore
 */

const isAscii = require( 'is-ascii' )
const { Model, QueryBuilder } = require( 'objection' )

const { akharToUnicode } = require( '../utils' )

class LineQueryBuilder extends QueryBuilder {
  /**
   * Given a string of first letters, return a query that searches for the shabad
   * @param letters The first letters to search for a partial match of
   */
  firstLetters( letters ) {
    const firstLetters = isAscii( letters ) ? akharToUnicode( letters ) : letters
    return this.where( 'first_letters', 'LIKE', `%${firstLetters}%` )
  }
}

class Lines extends Model {
  static get tableName() {
    return 'Lines'
  }

  static get QueryBuilder() {
    return LineQueryBuilder
  }

  static get relationMappings() {
    return {
      type: {
        relation: Model.HasOneRelation,
        join: {
          from: 'Lines.type_id',
          to: 'Line_Types.id',
        },
        // eslint-disable-next-line
        modelClass: require( './LineTypes' )
      },
      shabad: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'Lines.shabad_id',
          to: 'Shabads.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' )
      },
    }
  }

  static get useLimitInFirst() {
    return true
  }
}

module.exports = Lines
