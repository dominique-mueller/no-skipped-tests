import chalk from 'chalk';
import * as ora from 'ora';

import { defaultOptions } from './src/constants/default-options';
import { getFilesByPattern } from './src/get-files-by-pattern';
import { NoSkippedTestsAnalyzer } from './src/no-skipped-tests-analyzer';
import { NoSkippedTestsAnalyzerError } from './src/interfaces/no-skipped-tests-analyzer-error.interface';
import { NoSkippedTestsAnalyzerResult } from './src/interfaces/no-skipped-tests-analyzer-result.interface';
import { NoSkippedTestsOptions } from './src/interfaces/options.interface';

/**
 * Analyze files for skipped tests
 *
 * @param   [customOptions={}] - Options, default options as fallback
 * @returns                    - Promise, resolves when done with the analysis results for all files matching the given pattern
 */
export async function analyzeFilesForSkippedTests( customOptions: NoSkippedTestsOptions = {} ):
	Promise<Array<NoSkippedTestsAnalyzerResult>> {

	// Get options
	const options: NoSkippedTestsOptions = { ...defaultOptions, ...customOptions };

	// Get list of files (relative file paths, to be specific) matching the given pattern, but exit early of no files are found
	let logger: any;
	if ( options.log ) {
		logger = ora( 'Searching files' ).start();
	}
	let filePaths: Array<string>;
	try {
		filePaths = await getFilesByPattern( options.pattern );
	} catch ( error ) {
		if ( options.log ) {
			logger.stop();
			console.error( chalk.red( 'AN UNEXPECTED ERROR OCCURED:' ), chalk.white( error.toString() ) );
		}
		throw new Error( error.message );
	}
	const numberOfFiles: number = filePaths.length;
	if ( numberOfFiles === 0 ) {
		if ( options.log ) {
			logger.stop();
			console.warn( chalk.white.bgYellow( ' WARNING ' ), `No files found using the given pattern ("${ options.pattern }").` );
		}
		return [];
	}

	// Analyze all files (asynchronously, #perfmatters)
	if ( options.log ) {
		logger.text = 'Analyzing files for skipped tests [0%]';
	}
	let numberOfAnalyzedFiles: number = 0;
	let results: Array<NoSkippedTestsAnalyzerResult>;
	try {
		results = await Promise.all(
			filePaths.map( async( filePath: string ): Promise<NoSkippedTestsAnalyzerResult> => {
				if ( options.log ) {
					numberOfAnalyzedFiles++;
					logger.text = `Analyzing files for skipped tests [${ Math.round( ( numberOfAnalyzedFiles / numberOfFiles ) * 100 ) }%]`;
				}
				return ( new NoSkippedTestsAnalyzer( filePath ) ).analyze();
			} )
		);
	} catch ( error ) {
		if ( options.log ) {
			logger.stop();
			console.error( chalk.red( 'AN UNEXPECTED ERROR OCCURED:' ), chalk.white( error.toString() ) );
		}
		throw new Error( error.message );
	}

	// Log results (success or error)
	if ( options.log ) {

		logger.stop();
		const numberOfErrors: number = results.reduce( ( accumulatedValue: number, currentValue: NoSkippedTestsAnalyzerResult ): number => {
			return accumulatedValue + currentValue.errors.length;
		}, 0 );
		if ( numberOfErrors === 0 ) {
			console.log( chalk.white.bgGreen( ' OK ' ), 'Everything is fine, all tests are active.' );
		} else {

			console.log( chalk.white.bgRed( ' ERROR ' ), `Seems that not all tests are active (${ numberOfErrors } issues found).` );
			console.log( '' );

			// Show errors for the same file beneath each other
			results.forEach( ( fileResult: NoSkippedTestsAnalyzerResult ): void => {
				if ( fileResult.errors.length !== 0 ) {
					fileResult.errors.forEach( ( error: NoSkippedTestsAnalyzerError ): void => {
						console.log(
							chalk.red( `        ${ fileResult.filePath } (${ error.line }:${ error.char }):` ),
							chalk.white( `Found "${ error.identifier }"` )
						);
					} );
				}
			} );

			console.log( '' );

		}

	}

	return results;

}

analyzeFilesForSkippedTests();
