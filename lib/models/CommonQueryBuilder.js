const { QueryBuilder } = require( 'objection' )

/**
 * Factory for a QueryBuilder with generic helpers for fetching translations and transliterations.
 * @param linesRelation The relations path to the line. E.g. shabads.lines
 */
const CommonQueryBuilderFactory = linesRelation =>
  class CommonQueryBuilder extends QueryBuilder {
    constructor( ...props ) {
      super( ...props )

      this.linesRelation = linesRelation ? `${linesRelation}.` : ''
    }

    /**
   * Fetches the translations for the queried lines.
   * ! Chaining .first() and other aggregators will cut off translation results too.
   * @param translationSources Array of translation source IDs to filter. If undefined, gets all.
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
