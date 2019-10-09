/**
 * Objection Model for Lines, with custom query builder.
 * @ignore
 */

const isAscii = require( 'is-ascii' )
const { Model, raw } = require( 'objection' )
const { unzip } = require( 'lodash' )

const { toAscii } = require( 'gurmukhi-utils' )

const BaseModel = require( './BaseModel' )
const CommonQueryBuilder = require( './CommonQueryBuilder' )()

class LineQueryBuilder extends CommonQueryBuilder {
  /**
   * Given a search query and column name, return a query that searches for the shabad.
   * @param search The query text to search for a partial match of.
   * @param field The column name to query against.
   * @param orderResults Apply sensible ordering too. `true` by default.
   */
  genericSearch( search, field, orderResults = true ) {
    let query = this
    // Convert query to ASCII if they are not
    const asciiSearch = !isAscii( search ) ? toAscii( search ) : search

    // Append the WHERE field LIKE clause and select distinct results
    query = query
      .select( '*' )
      .distinct( 'lines.id' )
      .where( field, 'LIKE', `%${asciiSearch}%` )

    // Only apply sensible ordering if specified
    if ( orderResults ) {
      query = query.orderResults( asciiSearch, field )
    }

    return query
  }

  /**
   * Orders the results by: exact match, exact match before heavy pause,
   * exact match after heavy pause, first letters matching, anywhere matching.
   * @param search The search to order by.
   * @param field The column name to query against.
   * @private
   */
  orderResults( search, field ) {
    // Wildcards for search ordering
    const [ variants, fields ] = unzip( [
      [ search, field ],
      [ `${search};%`, `vishraam_${field}` ],
      [ `%;${search}`, `vishraam_${field}` ],
      [ `${search}%`, field ],
      [ `%${search}%`, field ],
    ] )

    // Generate the WHEN conditions for ordering
    const cases = variants.reduce( ( cases, _, i ) => `${cases} WHEN ${fields[ i ]} LIKE ? THEN ${i}`, '' )

    // Generate the full CASE ... END clause
    const orderBy = raw( `CASE ${cases} ELSE ${variants.length} END`, variants )

    return this.orderBy( orderBy )
  }

  /**
   * Given a string of first letters, return a query that searches for the shabad.
   * @param letters The first letters to search for a partial match of.
   * @param orderResults Apply sensible ordering too. `true` by default.
   */
  firstLetters( letters, orderResults = true ) {
    return this.genericSearch( letters, 'first_letters', orderResults )
  }

  /**
   * Given a phrase, return a query that searches for the shabad.
   * @param phrase the phrase text to match.
   * @param orderResults Apply sensible ordering too. `true` by default.
   */
  fullWord( phrase, orderResults ) {
    return this.genericSearch( phrase, 'gurmukhi', orderResults )
  }
}

class Lines extends BaseModel {
  static get tableName() {
    return 'lines'
  }

  static get QueryBuilder() {
    return LineQueryBuilder
  }

  static get relationMappings() {
    return {
      type: {
        relation: Model.HasOneRelation,
        join: {
          from: 'lines.type_id',
          to: 'line_types.id',
        },
        // eslint-disable-next-line
        modelClass: require( './LineTypes' ),
      },
      shabad: {
        relation: Model.BelongsToOneRelation,
        join: {
          from: 'lines.shabad_id',
          to: 'shabads.id',
        },
        // eslint-disable-next-line
        modelClass: require( './Shabads' ),
      },
      translations: {
        relation: Model.HasManyRelation,
        join: {
          from: 'lines.id',
          to: 'translations.line_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Translations' ),
      },
      transliterations: {
        relation: Model.HasManyRelation,
        join: {
          from: 'lines.id',
          to: 'transliterations.line_id',
        },
        // eslint-disable-next-line
        modelClass: require( './Transliterations' ),
      },
    }
  }
}

module.exports = Lines
