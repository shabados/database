/**
 * Creates schema
 */
exports.up = knex => Promise.all( [
  knex.schema.createTable( 'raags', table => {
    table.increments( 'id' ).primary()
    table.text( 'name' ).notNullable().unique()
  } ),

  knex.schema.createTable( 'sources', table => {
    table.increments( 'id' ).primary()
    table.text( 'name' ).notNullable().unique()
  } ),

  knex.schema.createTable( 'writers', table => {
    table.increments( 'id' ).primary()
    table.text( 'name' ).notNullable().unique()
  } ),

  knex.schema.createTable( 'shabad_types', table => {
    table.increments( 'id' ).primary()
    table.text( 'name' ).notNullable().unique()
  } ),

  knex.schema.createTable( 'shabads', table => {
    table.increments( 'id' ).primary()
    table.integer( 'ghar' )
    table.integer( 'raag_id' ).references( 'id' ).inTable( 'raags' )
    table.integer( 'type_id' ).references( 'id' ).inTable( 'shabad_types' )
    table.integer( 'writer_id' ).references( 'id' ).inTable( 'writers' ) // Make notNullable once we figure out how to get the data
    table.integer( 'source_id' ).references( 'id' ).inTable( 'sources' ).notNullable()
  } ),

  knex.schema.createTable( 'line_types', table => {
    table.increments( 'id' ).primary()
    table.text( 'name' ).notNullable().unique()
  } ),

  knex.schema.createTable( 'lines', table => {
    table.increments( 'id' ).primary()
    table.integer( 'ang' ).notNullable()
    table.integer( 'shabad_id' ).references( 'id' ).inTable( 'shabads' ).notNullable()
    table.text( 'gurmukhi' ).notNullable()
    table.integer( 'pada' )
    table.integer( 'source_line' )
    table.text( 'first_letters' )
    table.text( 'english' )
    table.text( 'punjabi' )
    table.text( 'transliteration' )
    table.text( 'pronunciation' )
    table.integer( 'type_id' ).references( 'id' ).inTable( 'line_types' )
  } ),

  knex.schema.createTable( 'banis', table => {
    table.increments( 'id' ).primary()
    table.text( 'name' ).notNullable().unique()
  } ),

  knex.schema.createTable( 'bani_lines', table => {
    table.integer( 'line_id' ).references( 'id' ).inTable( 'lines' )
    table.integer( 'bani_id' ).references( 'id' ).inTable( 'banis' )
    table.primary( [ 'line_id', 'bani_id' ] )
  } ),
] )

/**
 * Drops schema
 */
exports.down = knex => Promise.all( [
  knex.schema.dropTable( 'bani_lines' ),
  knex.schema.dropTable( 'banis' ),
  knex.schema.dropTable( 'lines' ),
  knex.schema.dropTable( 'line_types' ),
  knex.schema.dropTable( 'shabads' ),
  knex.schema.dropTable( 'raags' ),
  knex.schema.dropTable( 'writers' ),
  knex.schema.dropTable( 'sources' ),
  knex.schema.dropTable( 'shabad_types' ),
] )
