const program = require( 'commander' )

const main = async () => {
  program
    .version( '0.0.1' )
    .arguments( '<input>' )
    .option( '-s --shabad-id <column>', 'Shabad ID column name', 'ShabadID' )
    .option( '-t, --translation <column>', 'column name of a translation', ( val, prev ) => [ ...prev, val ], [] )
    .option( '-p, --page <column>', 'Page number column name', 'PageNo' )
    .option( '-l, --line <column>', 'Line number column name', 'LineNo' )
    .option( '-S, --sttm <column>', 'STTM 2 ID column name', 'ID' )
    .option( '-g, --gurmukhi <column>', 'Gurmukhi column name', 'Gurmukhi' )
    .parse( process.argv )

  const [ filename ] = program.args

  if ( !filename ) program.outputHelp()
}

main()
  .then( () => process.exit( 0 ) )
  .catch( e => console.error( e ) && process.exit( 1 ) )
