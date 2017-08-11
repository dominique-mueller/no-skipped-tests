import * as chalk from 'chalk';
import * as ora from 'ora';

import { NoSkippedTestsAnalyzer } from './no-skipped-tests-analyzer';
import { getFilesByPattern } from './utilities/get-files-by-pattern';
import { NoSkippedTestsOptions } from './interfaces/options.interface';
import { defaultOptions } from './constants/default-options';
import { NoSkippedTestsAnalyzerError } from './interfaces/no-skipped-tests-analyzer-error.interface';
import { NoSkippedTestsAnalyzerResult } from './interfaces/no-skipped-tests-analyzer-result.interface';

/**
 * Main process
 *
 * @param   [options={}] - Options, default options as fallback
 * @returns              - Promise, resolves when done
 */
export function main( options: NoSkippedTestsOptions = {} ): Promise<void> {
	return new Promise<void>( async( resolve: () => void, reject: ( error?: Error ) => void ) => {

		// Get options
		const mergedOptions: NoSkippedTestsOptions = Object.assign( defaultOptions, options );

		// Get list of files (relative file paths, to be specific) matching the given pattern
		const log = ora( 'Searching files' ).start();
		let files: Array<string>;
		try {
			files = await getFilesByPattern( '**/*.spec.ts' );
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
			const promise: Promise<NoSkippedTestsAnalyzerResult> = noSkippedTestsAnalyzer.analyze();
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
		let results: Array<NoSkippedTestsAnalyzerResult> = await Promise.all( analysisPromises );
		const numberOfErrors: number = results.reduce( ( accumulatedValue: number, currentValue: NoSkippedTestsAnalyzerResult ) => {
			return accumulatedValue + currentValue.errors.length;
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
			results.forEach( ( fileResult: NoSkippedTestsAnalyzerResult ) => {
				const numberOfFileErrors: number = fileResult.errors.length;
				if ( numberOfFileErrors !== 0 ) {
					fileResult.errors.forEach( ( error: NoSkippedTestsAnalyzerError ) => {
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
