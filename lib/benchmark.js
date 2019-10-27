
const colors = require( './string-colors' )
const { Lines, Banis } = require( '../' )

const BENCHMARK_COUNT = 10
const MS_THRESHOLD = 50

const msColor = ms => ( ms <= MS_THRESHOLD ? `${ms}ms`.success : `${ms}ms`.warning )

const firstLetterSearch = search => Lines.query().firstLetters( search )

const fullWordSearch = search => Lines.query().fullWord( search )

const getBanisWithSections = () => Banis.query()

const getBaniLines = baniId => Banis
  .query()
  .joinEager( 'lines.shabad' )
  .orderBy( [ 'line_group', 'l.order_id' ] )
  .where( 'banis.id', baniId )
  .withTranslations()
  .withTransliterations()
  .eagerOptions( { minimize: false, aliases: { lines: 'l' } } )
  .then( ( [ bani ] ) => bani )

// Runs an async function count times and returns the average
const benchmark = async ( fn, count = BENCHMARK_COUNT ) => {
  let sum = 0
  const results = []
  for ( let i = 1; i <= count; i += 1 ) {
    const startTime = new Date()
    results.push( await fn() )
    const duration = Date.now() - startTime.getTime()

    sum += duration
  }

  const average = sum / count

  return { average, res: results[ results.length - 1 ], results }
}


// Benchmarks 4 searches
const main = async () => {
  console.log( 'Running benchmarks'.header )
  console.log( `${BENCHMARK_COUNT}`.value, 'samples will be collected' )

  console.log( '\nFirst Letter Searching'.subheader )
  const firstLetterSearches = [ 'hh', 'hhh', 'hhhh', 'hhhgg', 'h_r_p' ]
  for ( const search of firstLetterSearches ) {
    const { average, res } = await benchmark( () => firstLetterSearch( search ) )
    console.log( `${search}:`.value, msColor( average ), `(${res.length} lines)` )
  }

  console.log( '\nFull Word Searching'.subheader )
  const fullWordSearches = [ 'ihr', 'jo jnu' ]
  for ( const search of fullWordSearches ) {
    const { average, res } = await benchmark( () => fullWordSearch( search ) )
    console.log( `${search}:`.value, msColor( average ), `(${res.length} lines)` )
  }

  console.log( '\nAll Banis'.subheader )
  const { average: banisAverage, res: banis } = await benchmark( getBanisWithSections )
  console.log( 'All Banis:'.value, msColor( banisAverage ), `(${banis.length} results)` )

  console.log( '\nAll Bani Lines'.subheader )
  for ( const bani of banis ) {
    const { average, res } = await benchmark( () => getBaniLines( bani.id ) )
    console.log( `${bani.nameEnglish}:`.value, msColor( average ), `(${res.lines.length} lines)` )
  }
}

main().then( process.exit )
