import * as chalk from 'chalk';
import * as glob from 'glob';
import * as ora from 'ora';

import { NoSkippedTestsAnalyzer } from './src/no-skipped-tests-analyzer';

// TODO: Extract into files

export function getFilesToAnalyze( pattern: string ): Promise<Array<string>> {
	return new Promise<Array<string>>( ( resolve: ( files: Array<string> ) => void, reject: () => void ) => {

		glob( pattern, ( error, files: Array<string> ) => {

			if ( error ) {
				// TODO: Handle error
				return;
			}

			resolve( files );

		} );

	} );
}

async function run() {

	// TODO: try-catch errors / catch rejected promise

	console.log( '' );
	const log = ora( 'Searching files' ).start();

	// TODO: Read pattern from argument, assume spec files (ts + js) by default
	const files: Array<string> = await getFilesToAnalyze( '**/*.spec.ts' );

	// Exit early if no files are found
	if ( files.length === 0 ) {
		log.stop();
		console.log( chalk.white.bgYellow( ' WARNING ' ), 'No files found with the given pattern.' );
		console.log( '' );
		process.exit( 0 );
		return;
	}

	// Analyze all files (asynchronously, #perfmatters)
	log.text = 'Analyzing files for skipped tests [0%]';
	const analysisPromises: Array<Promise<any>> = [];
	const numberOfFiles: number = files.length;
	let finished: number = 0;
	files.forEach( ( filePath: string ) => {
		const noSkippedTestsAnalyzer: NoSkippedTestsAnalyzer = new NoSkippedTestsAnalyzer( filePath );
		const promise: Promise<any> = noSkippedTestsAnalyzer.analyze();
		promise.then( () => {
			finished++;
			log.text = `Analyzing files for skipped tests [${ Math.round( ( finished / numberOfFiles ) * 100 ) }%]`;
		} );
		analysisPromises.push( promise );
	} );

	const results: any = await Promise.all( analysisPromises );
	const numberOfErrors: number = results.reduce( ( accumulatedValue: number, currentValue: any ) => {
		return accumulatedValue + ( <Array<any>> currentValue.errors ).length;
	}, 0 );

	log.stop();

	if ( numberOfErrors === 0 ) {

		console.log( chalk.white.bgGreen( ' OK ' ), 'Everything is fine, all tests are active.' );
		console.log( '' );
		process.exit( 0 );

	} else {

		console.log( chalk.white.bgRed( ' ERROR ' ), `Seems that not all tests are active (${ numberOfErrors } issues found).` );
		console.log( '' );

		// Show errors for the same file beneath each other
		results.forEach( ( fileResult: any ) => {

			const numberOfFileErrors: number = fileResult.errors.length;
			if ( numberOfFileErrors !== 0 ) {

				fileResult.errors.forEach( ( error: any ) => {
					console.log(
						chalk.red( `        ${ fileResult.filePath } (${ error.line }:${ error.char }):` ),
						chalk.white( `Found "${ error.identifier }"` )
					);
				} );

			}

		} );

		console.log( '' );
		process.exit( 1 );

	}

}

run();
