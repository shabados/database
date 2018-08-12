/**
 * Objection Model for Lines, with custom query builder.
 * @ignore
 */

const isAscii = require( 'is-ascii' )
const { Model, QueryBuilder, raw } = require( 'objection' )

const { toAscii } = require( 'gurmukhi-utils' )

const BaseModel = require( './BaseModel' )


class LineQueryBuilder extends QueryBuilder {
  /**
   * Given a string of first letters, return a query that searches for the shabad.
   * @param letters The first letters to search for a partial match of.
   * @param shouldOrder Apply sensible ordering too. `true` by default.
   */
  firstLetters( letters, shouldOrder = true ) {
    let query = this
    // Convert letters to ASCII if they are not
    const firstLetters = !isAscii( letters ) ? toAscii( letters ) : letters

    // Append the WHERE first_letters LIKE clause
    query = query.where( 'first_letters', 'LIKE', `%${firstLetters}%` )

    // Only apply sensible ordering if specified
    if ( shouldOrder ) {
      query = query.orderFirstLetters( letters )
    }

    return query
  }

  /**
   * Orders the results by: exact match, first letters matching, anywhere matching.
   * @param letters The first letters to order by.
   * @private
   */
  orderFirstLetters( letters ) {
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

class Lines extends BaseModel {
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
        modelClass: require( './LineTypes' ),
      },
      shabad: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'Lines.shabad_id',
          to: 'Shabads.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' ),
      },
      translations: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Lines.id',
          to: 'Translations.line_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Translations' ),
      },
    }
  }
}

module.exports = Lines
