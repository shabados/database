/* eslint-disable prefer-arrow-callback,import/no-extraneous-dependencies */
/* global describe,it */
const { expect } = require( 'chai' )

const { Lines, Shabads, Writers, Types, Raags, Source, Banis } = require( '../index' )
const sources = require( '../seeds/sources' )


describe( 'Shabads', function () {
  describe( 'First Shabad', function () {
    it( 'should have a source of SGGS from sources.json', async function () {
      const [ sggs ] = sources

      const { source: { name } } = await Shabads.query().eager( 'source' ).first()

      expect( name ).to.equal( sggs )
    } )
  } )
} )
