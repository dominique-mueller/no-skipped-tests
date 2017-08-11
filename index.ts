import * as chalk from 'chalk';
import * as glob from 'glob';
import * as ora from 'ora';

import { NoSkippedTestsAnalyzer } from './src/no-skipped-tests-analyzer';

// TODO: Extract into files

export interface Options {
	pattern?: string;
}

export function getFilesToAnalyze( pattern: string ): Promise<Array<string>> {
	return new Promise<Array<string>>( ( resolve: ( files: Array<string> ) => void, reject: ( error: Error ) => void ) => {

		glob( pattern, ( error, files: Array<string> ) => {

			// Handle errors
			if ( error ) {
				reject( error );
				return;
			}

			resolve( files );

		} );

	} );
}

export const defaultOptions: Options = {
	pattern: '**/*.spec.ts' // TODO: Include js, jsx, tsx specs ...
};

function run( options: Options = {} ): Promise<void> {

	return new Promise<void>( async( resolve: () => void, reject: ( error?: Error ) => void ) => {

		// Get options
		const mergedOptions: Options = Object.assign( defaultOptions, options );

		// Get list of files (relative file paths, to be specific) matching the given pattern
		const log = ora( 'Searching files' ).start();
		let files: Array<string>;
		try {
			files = await getFilesToAnalyze( '**/*.spec.ts' );
		} catch ( error ) {
			log.stop();
			reject( error );
			return;
		}

		// Exit early if no files are found
		if ( files.length === 0 ) {
			log.stop();
			console.warn( chalk.white.bgYellow( ' WARNING ' ), `No files found using the given pattern ("${ options.pattern }").` );
			resolve();
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
			promise
				.then( () => {
					finished++;
					log.text = `Analyzing files for skipped tests [${ Math.round( ( finished / numberOfFiles ) * 100 ) }%]`;
				} )
				.catch( ( error: Error ) => {
					log.stop();
					reject( error );
					return;
				} );
			analysisPromises.push( promise );
		} );

		// Collect the results
		let results: any = await Promise.all( analysisPromises );
		const numberOfErrors: number = results.reduce( ( accumulatedValue: number, currentValue: any ) => {
			return accumulatedValue + ( <Array<any>> currentValue.errors ).length;
		}, 0 );

		// Log results (success or error)
		log.stop();
		if ( numberOfErrors === 0 ) {

			console.log( chalk.white.bgGreen( ' OK ' ), 'Everything is fine, all tests are active.' );
			resolve();

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

			reject();

		}

	} );

}

console.log( '' );
run( {
	pattern: 'example/**/*.spec.ts'
} )
	.then( () => {
		console.log( '' );
		process.exit( 0 );
	} )
	.catch( ( error?: Error ) => {
		if ( error ) {
			console.error( chalk.red( 'AN UNEXPECTED ERROR OCCURED:' ), chalk.white( error.toString() ) );
		}
		console.log( '' );
		process.exit( 1 );
	} );
