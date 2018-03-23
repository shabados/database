const { Lines } = require( '../' )

// Does a basic search and times it
const timeSearch = search => {
  const startTime = new Date()

  return Lines.query().firstLetters( search ).then( lines => {
    let endTime = new Date()
    const ms = endTime.getTime() - startTime.getTime()
    console.log( `${lines.length} lines in ${ms} ms` )
    return ms
  } )
}

// Runs 10 searches and logs the average
const benchmark = async search => {
  const count = 10


  let sum = 0
  for ( let i = 1; i <= count; i += 1 ) {
    sum += await timeSearch( search )
  }

  const average = sum / count
  console.log( `Ran ${count} benchmarks of ${search} in ${average}ms` )
}

// Benchmarks 4 searches
const main = async () => {
  const searches = [ 'hh', 'hhh', 'hhhh', 'hhhgg' ]

  for ( const search of searches ) {
    await benchmark( search )
  }
}

main().then( process.exit )
