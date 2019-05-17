/**
 * Objection Model for Lines, with custom query builder.
 * @ignore
 */

const isAscii = require( 'is-ascii' )
const { Model, raw } = require( 'objection' )

const { toAscii } = require( 'gurmukhi-utils' )

const BaseModel = require( './BaseModel' )
const CommonQueryBuilder = require( './CommonQueryBuilder' )()

class LineQueryBuilder extends CommonQueryBuilder {
  /**
   * Given a string of first letters, return a query that searches for the shabad.
   * @param letters The first letters to search for a partial match of.
   * @param shouldOrder Apply sensible ordering too. `true` by default.
   */
  firstLetters( letters, shouldOrder = true ) {
    return this.genericSearch( letters, 'first_letters', shouldOrder )
  }

  /**
   * Given a phrase, return a query that searches for the shabad.
   * @param phrase the phrase to match.
   * @param shouldOrder Apply sensible ordering too. `true` by default.
   */
  fullWord( phrase, shouldOrder ) {
    return this.genericSearch( phrase, 'gurmukhi', shouldOrder )
  }

  /**
   * Given a search query and column, return a query that searches for the shabad.
   * @param search The query to search for a partial match of.
   * @param field The field to query.
   * @param shouldOrder Apply sensible ordering too. `true` by default.
   */
  genericSearch( search, field, shouldOrder = true ) {
    let query = this
    // Convert query to ASCII if they are not
    const asciiSearch = !isAscii( search ) ? toAscii( search ) : search

    // Append the WHERE field LIKE clause
    query = query.where( field, 'LIKE', `%${asciiSearch}%` )

    // Only apply sensible ordering if specified
    if ( shouldOrder ) {
      query = query.orderSearch( asciiSearch, field )
    }

    return query
  }

  /**
   * Orders the results by: exact match, first letters matching, anywhere matching.
   * @param search The search to order by.
   * @param field The field to query.
   * @private
   */
  orderSearch( search, field ) {
    // Wildcards for exact match, first letters, letters anywhere
    const variants = [ search, `${search}%`, `%${search}%` ]

    // Generate the WHEN conditions for ordering
    const cases = variants.reduce( ( cases, _, i ) => `${cases} WHEN ${field} LIKE ? THEN ${i}`, '' )

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
      transliterations: {
        relation: Model.HasManyRelation,
        join: {
          from: 'Lines.id',
          to: 'Transliterations.line_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Transliterations' ),
      },
    }
  }
}

module.exports = Lines
