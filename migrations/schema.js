/**
 * Creates schema
 */
exports.up = knex => Promise.all( [
  knex.schema.createTable( 'raags', table => {
    table.increments( 'id' ).primary()
    table.text( 'name' ).notNullable()
  } ),

  knex.schema.createTable( 'sources', table => {
    table.increments( 'id' ).primary()
    table.text( 'name' ).notNullable()
  } ),

  knex.schema.createTable( 'writers', table => {
    table.increments( 'id' ).primary()
    table.text( 'name' ).notNullable()
  } ),

  knex.schema.createTable( 'bani', table => {
    table.increments( 'id' ).primary()
    table.integer( 'raag_id' ).references( 'id' ).inTable( 'raags' )
    table.integer( 'source_id' ).references( 'id' ).inTable( 'sources' )
    table.integer( 'writer_id' ).references( 'id' ).inTable( 'writers' )
  } ),

  knex.schema.createTable( 'lines', table => {
    table.increments( 'id' ).primary()
    table.integer( 'ang' ).notNullable()
    table.integer( 'bani_id' ).references( 'id' ).inTable( 'bani' ).notNullable()
    table.text( 'gurmukhi' ).notNullable()
    table.text( 'english' )
    table.text( 'punjabi' )
    table.text( 'transliteration' )
    table.text( 'pronounciation' )
  } ),
] )

/**
 * Drops schema
 */
exports.down = knex => Promise.all( [
  knex.schema.dropTable( 'raags' ),
  knex.schema.dropTable( 'writers' ),
  knex.schema.dropTable( 'sources' ),
  knex.schema.dropTable( 'bani' ),
  knex.schema.dropTable( 'lines' ),
] )
