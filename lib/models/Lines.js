/**
 * Objection Model for Lines, with custom query builder.
 * @ignore
 */

const isAscii = require( 'is-ascii' )
const { Model, QueryBuilder, raw } = require( 'objection' )

const { akharToUnicode } = require( '../utils' )

class LineQueryBuilder extends QueryBuilder {
  /**
   * Given a string of first letters, return a query that searches for the shabad.
   * @param letters The first letters to search for a partial match of.
   */
  firstLetters( letters ) {
    const firstLetters = isAscii( letters ) ? akharToUnicode( letters ) : letters
    return this.where( 'first_letters', 'LIKE', `%${firstLetters}%` )
  }

  /**
   * Orders the results by: exact match, first letters matching, anywhere matching.
   * To be used in conjugation with `firstLetters()`/
   * @param letters The first letters to order by.
   */
  orderSensibly( letters ) {
    // Wildcards for exact match, first letters, letters anywhere
    const variants = [ letters, `${letters}%`, `%${letters}%` ]

    // Generate the WHEN conditions for ordering
    const cases = variants.reduce( (
      cases,
      letters,
      i,
    ) => `${cases} WHEN first_letters LIKE ? THEN ${i}`, '' )

    // Generate the full CASE ... END clause
    const orderBy = raw( `CASE ${cases} ELSE ${variants.length} END`, variants )

    return this.orderBy( orderBy )
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
