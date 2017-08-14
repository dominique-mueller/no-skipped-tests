import * as chalk from 'chalk';

import { analyzeFilesForSkippedTests } from './src/main';
import { NoSkippedTestsOptions } from 'src/interfaces/options.interface';
import { NoSkippedTestsAnalyzerResult } from 'src/interfaces/no-skipped-tests-analyzer-result.interface';

export { analyzeFilesForSkippedTests } from './src/main';
export { NoSkippedTestsOptions } from 'src/interfaces/options.interface';
export { NoSkippedTestsAnalyzerResult } from 'src/interfaces/no-skipped-tests-analyzer-result.interface';

// Collect command line parameters (only pattern for now)
const parameters = process.argv.slice( 2 );
const options: NoSkippedTestsOptions = {};
if ( parameters.length > 0 ) {
	options.pattern = parameters[ 0 ];
}

// MAIN
console.log( '' );
analyzeFilesForSkippedTests( options )
	.then( ( results: Array<NoSkippedTestsAnalyzerResult> ) => {
		console.log( '' );
		if ( results.length === 0 ) {
			process.exit( 0 );
		} else {
			process.exit( 1 );
		}
	} )
	.catch( ( error?: Error ) => {
		if ( error ) {
			console.error( chalk.red( 'AN UNEXPECTED ERROR OCCURED:' ), chalk.white( error.toString() ) );
		}
		console.log( '' );
		process.exit( 1 );
	} );
