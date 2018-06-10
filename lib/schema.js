/**
 * Sets up MySQL/MariaDB specific requirements.
 * @param {*} table The table to apply the requirements to.
 */
const setupMySQL = table => {
  table.charset( 'utf8mb4_unicode_ci' )
  table.collate( 'utf8mb4_unicode_ci' )
  table.engine( 'Aria' )
}

/**
 * The schema as per `schema.png`, defined by Knex statements.
 */
const createSchema = knex =>
  Promise.all( [
    knex.schema.createTable( 'sections', table => {
      setupMySQL( table )
      table.increments( 'id' ).primary()
      table.text( 'name_gurmukhi' ).notNullable().unique()
      table.text( 'name_english' ).notNullable().unique()
      table.text( 'description' ).notNullable()
      table.integer( 'start_page' ).notNullable()
      table.integer( 'end_page' ).notNullable()
      table.integer( 'source_id' ).references( 'id' ).inTable( 'sources' ).notNullable()
    } ),

    knex.schema.createTable( 'subsections', table => {
      setupMySQL( table )
      table.increments( 'id' ).primary()
      table.integer( 'section_id' ).references( 'id' ).inTable( 'section' ).notNullable()
      table.text( 'name_gurmukhi' ).notNullable()
      table.text( 'name_english' ).notNullable()
      table.integer( 'start_page' )
      table.integer( 'end_page' )
    } ),

    knex.schema.createTable( 'sources', table => {
      setupMySQL( table )
      table.increments( 'id' ).primary()
      table.text( 'name_gurmukhi' ).notNullable().unique()
      table.text( 'name_english' ).notNullable().unique()
      table.integer( 'length' ).notNullable()
      table.text( 'page_name_english' ).notNullable()
      table.text( 'page_name_gurmukhi' ).notNullable()
    } ),

    knex.schema.createTable( 'writers', table => {
      setupMySQL( table )
      table.increments( 'id' ).primary()
      table.text( 'name_gurmukhi' ).notNullable().unique()
      table.text( 'name_english' ).notNullable().unique()
    } ),

    knex.schema.createTable( 'shabads', table => {
      setupMySQL( table )
      table.string( 'id', '3' ).primary()
      table.integer( 'source_id' ).references( 'id' ).inTable( 'sources' ).notNullable()
      table.integer( 'writer_id' ).references( 'id' ).inTable( 'writers' ).notNullable()
      table.integer( 'section_id' ).references( 'id' ).inTable( 'sections' ).notNullable()
      table.integer( 'subsection_id' ).references( 'id' ).inTable( 'subsections' )
      table.integer( 'sttm2_id' )
      table.integer( 'order_id' ).notNullable().unique()
    } ),

    knex.schema.createTable( 'line_types', table => {
      setupMySQL( table )
      table.increments( 'id' ).primary()
      table.text( 'name_gurmukhi' ).notNullable().unique()
      table.text( 'name_english' ).notNullable().unique()
    } ),

    knex.schema.createTable( 'lines', table => {
      setupMySQL( table )
      table.string( 'id', 4 ).primary()
      table
        .string( 'shabad_id', 3 )
        .references( 'id' )
        .inTable( 'shabads' )
        .notNullable()
        .index()
      table.integer( 'source_page' ).notNullable()
      table.integer( 'source_line' )
      table.text( 'first_letters' )
      table.text( 'gurmukhi' ).notNullable()
      table.text( 'transliteration_english' ).notNullable()
      table.text( 'transliteration_hindi' ).notNullable()
      table.text( 'pronunciation' )
      table.text( 'pronunciation_information' )
      table.integer( 'type_id' ).references( 'id' ).inTable( 'line_types' )
      table.integer( 'order_id' ).notNullable().unique()
    } ),

    knex.schema.createTable( 'languages', table => {
      setupMySQL( table )
      table.increments( 'id' ).primary()
      table.text( 'name_gurmukhi' ).notNullable().unique()
      table.text( 'name_english' ).notNullable().unique()
      table.text( 'name_international' ).unique()
    } ),

    knex.schema.createTable( 'translation_sources', table => {
      setupMySQL( table )
      table.increments( 'id' ).primary()
      table.text( 'name_gurmukhi' ).notNullable()
      table.text( 'name_english' ).notNullable()
      table.integer( 'source_id' ).references( 'id' ).inTable( 'sources' ).notNullable()
      table.integer( 'language_id' ).references( 'id' ).inTable( 'languages' ).notNullable()
    } ),

    knex.schema.createTable( 'translations', table => {
      setupMySQL( table )
      table.string( 'line_id', 4 ).references( 'id' ).inTable( 'lines' ).notNullable()
      table
        .integer( 'translation_source_id' )
        .references( 'id' )
        .inTable( 'translation_sources' )
        .notNullable()
      table.text( 'translation' ).notNullable()
      table.json( 'additional_information' )
      table.primary( [ 'line_id', 'translation_source_id' ] )
    } ),

    knex.schema.createTable( 'banis', table => {
      setupMySQL( table )
      table.increments( 'id' ).primary()
      table.text( 'name_gurmukhi' ).notNullable().unique()
      table.text( 'name_english' ).notNullable().unique()
    } ),

    knex.schema.createTable( 'bani_lines', table => {
      setupMySQL( table )
      table.string( 'line_id', 4 ).references( 'id' ).inTable( 'lines' ).notNullable()
      table.integer( 'bani_id' ).references( 'id' ).inTable( 'banis' ).notNullable()
      table.integer( 'line_group' ).notNullable()
      table.primary( [ 'line_id', 'bani_id', 'line_group' ] )
    } ),
  ] )

module.exports = createSchema
