const { QueryBuilder } = require( 'objection' )
const { groupBy } = require( 'lodash' )

const Translations = require( './Translations' )
const Transliterations = require( './Transliterations' )

/**
 * Factory for a QueryBuilder with generic helpers for fetching translations and transliterations.
 * @param linesRelation The relations path to the line. E.g. shabads.lines
 */
const CommonQueryBuilderFactory = linesRelation => class CommonQueryBuilder extends QueryBuilder {
  constructor( ...props ) {
    super( ...props )

    this.linesRelation = linesRelation ? `${linesRelation}.` : ''
  }

  /**
   * Fetches the corresponding lines from a Model, given some Line IDs.
   * Appends it to the results of the model, simulating an many-to-many eager query on 'lines'.
   * @param {*} Model The Objection model to query against.
   * @param {*} fieldName The name of field to append to, in each line's result.
   */
  appendModelField( Model, fieldName ) {
    return (
      getLineIds,
      modifyModelQuery = query => query,
    ) => this.runAfter( async results => Promise.all( (
      results.map( result => modifyModelQuery( Model
        .query()
        .whereIn( 'line_id', getLineIds( result ) ) )
        .then( modelResults => {
          // If there aren't multiple lines returned, add the field to the result
          if ( !result.lines ) {
            // eslint-disable-next-line no-param-reassign
            result[ fieldName ] = modelResults
            return result
          }

          // Group the model's results by line id
          const fieldById = groupBy( modelResults, 'lineId' )

          // Append each model result to corresponding fieldName of each line
          result.lines.forEach( line => {
            //* Mutate for speed
            // eslint-disable-next-line no-param-reassign
            line[ fieldName ] = fieldById[ line.id ]
          } )

          return result
        } ) )
    ) ) )
  }

  appendTranslations( ...params ) {
    return this.appendModelField( Translations, 'translations' )( ...params )
  }

  appendTransliterations( ...params ) {
    return this.appendModelField( Transliterations, 'transliterations' )( ...params )
  }

  /**
   * Fetches the translations for the queried lines.
   * ! Chaining .first() and other aggregators will cut off translation results too.
   * @param translationSources Array of translation source IDs to filter. If undefined, gets all.
   * @deprecated Do not use. It is slow. See Banis.withTranslations(), Shabad.withTranslations().
   */
  withTranslations( translationSources ) {
    return this
      .eagerOptions( { minimize: true } )
      .mergeEager( `${this.linesRelation}translations(filterSources).translationSource.language`, {
        filterSources: builder => ( translationSources
          ? translationSources.forEach( id => builder.orWhere( 'translation_source_id', id ) )
          : null ),
      } )
  }

  /**
    * Fetches the transliterations for the queried lines.
    * ! Chaining .first() and other aggregators will cut off transliteration results too.
    * @param languages Array of language IDs to filter. If undefined, fetches all transliterations.
    * @deprecated Do not use. It is slow. See Banis.getTranslations(), Shabad.getTranslations().
    */
  withTransliterations( languages ) {
    return this
      .eagerOptions( { minimize: true } )
      .mergeEager( `${this.linesRelation}transliterations(filterLanguages).language`, {
        filterLanguages: builder => ( languages
          ? languages.forEach( id => builder.orWhere( 'language_id', id ) )
          : null ),
      } )
  }
}

module.exports = CommonQueryBuilderFactory
