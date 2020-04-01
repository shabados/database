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
  static getLineIds( line ) {
    return [ line.id ]
  }

  withTranslations( ...params ) {
    return super.appendTranslations( LineQueryBuilder.getLineIds, ...params )
  }

  withTransliterations( ...params ) {
    return super.appendTransliterations( LineQueryBuilder.getLineIds, ...params )
  }

  /**
   * Given a search query and column name, return a query that searches for the shabad.
   * @param search The query text to search for a partial match of.
   * @param field The column name to query against.
   * @param orderResults Apply sensible ordering too. `true` by default.
   * @param anywhere Search for `search` anywhere, not just at the beginning. `true` by default.
   * @param heavyMatching Prioritise matches before/after heavy pause vishraam.
   */
  genericSearch( search, field, orderResults = true, anywhere = true, heavyMatching ) {
    let query = this
    // Convert query to ASCII if they are not
    const asciiSearch = !isAscii( search ) ? toAscii( search ) : search

    // Append the WHERE field LIKE clause and select distinct results
    query = query
      .select( '*' )
      .distinct( 'lines.id' )

    // Search first letters only if false, otherwise anywhere
    const value = !anywhere ? `${asciiSearch}%` : `%${asciiSearch}%`
    query = query.where( field, 'LIKE', value )

    // Only apply sensible ordering if specified
    if ( orderResults ) {
      query = query.orderResults( asciiSearch, field, heavyMatching )
    }

    return query
  }

  /**
   * Orders the results by: exact match, exact match before heavy pause,
   * exact match after heavy pause, first letters matching, anywhere matching.
   * @param search The search to order by.
   * @param field The column name to query against.
   * @param heavyMatching Prioritise matches before/after heavy pause vishraam.
   * @private
   */
  orderResults( search, field, heavyMatching ) {
    // Wildcards for search ordering
    const [ variants, fields ] = unzip( [
      [ search, field ],
      ...( heavyMatching ? [ [ `${search};%`, `vishraam_${field}` ] ] : [] ),
      ...( heavyMatching ? [ [ `%;${search}`, `vishraam_${field}` ] ] : [] ),
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
   * @param anywhere Search for `search` anywhere, not just at the beginning. `true` by default.
   */
  firstLetters( letters, orderResults = true, anywhere = true ) {
    return this.genericSearch( letters, 'first_letters', orderResults, anywhere, true )
  }

  /**
   * Given a phrase, return a query that searches for the shabad.
   * @param phrase the phrase text to match.
   * @param orderResults Apply sensible ordering too. `true` by default.
   * @param anywhere Search for `search` anywhere, not just at the beginning. `true` by default.
   */
  fullWord( phrase, orderResults = true, anywhere = true ) {
    return this.genericSearch( phrase, 'gurmukhi', orderResults, anywhere )
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
      content: {
        relation: Model.HasManyRelation,
        join: {
          from: 'lines.id',
          to: 'line_content.line_id',
        },
        // eslint-disable-next-line
        modelClass: require( './LineContent' ),
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
    }
  }
}

module.exports = Lines
