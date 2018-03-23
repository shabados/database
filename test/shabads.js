/* eslint-disable prefer-arrow-callback,import/no-extraneous-dependencies,global-require */
/* global describe,it */
const { expect } = require( 'chai' )

const { Shabads } = require( '../index' )
const sources = require( '../seeds/sources' )

describe( 'Shabads', function () {
  describe( 'First Shabad', function () {
    it( 'should have a source of SGGS from sources.json', async function () {
      const [ sggs ] = sources

      const { source: { name } } = await Shabads.query().first().eager( 'source' )

      expect( name ).to.equal( sggs )
    } )

    it( 'should have the same first line as seeds/1/0001/001.json', async function () {
      const [ firstLine ] = require( '../seeds/sources/1/0001/001.json' )

      const { lines } = await Shabads.query().first().eager( 'lines' )

      expect( lines[ 0 ].gurmukhi ).to.equal( firstLine.gurmukhi )
    } )
  } )
} )

// TODO: Write tests for confirming data in seeds/
// TODO: Finish writing model tests
