import * as fs from 'fs';
import * as path from 'path';

import * as typescript from 'typescript';

import { deepestIdentifiers, forbiddenIdentifiers } from './constants/identifiers';
import { NoSkippedTestsAnalyzerError } from './interfaces/no-skipped-tests-analyzer-error.interface';
import { NoSkippedTestsAnalyzerResult } from './interfaces/no-skipped-tests-analyzer-result.interface';

/**
 * No Skipped Tests Analyzer
 *
 * For each file to be analyzed for skipped tests (in particular, either focused or ignored tests), a separate analyzer has to be
 * instantiated, given the relative path of the file. This is necessary due to internal state sharing accross recursive function calls,
 * eventually allowing us to optimize the overall analysis performance.
 * Internally, we make use of the TypeScript Compiler API for analyzing the TypeScript / JavaScript code within the file content, therefore
 * preventing false-positives from popping up (for instance, in comparison to "only" using regex matching or something similar).
 */
export class NoSkippedTestsAnalyzer {

	/**
	 * Relative path of the file to be tested
	 */
	private readonly filePath: string;

	/**
	 * Current (recursion) depth within the AST, used for performance optimizations (#perfmatters)
	 */
	private currentASTDepth: number;

	/**
	 * Current AST depth to be ignored / skipped (the rest of it, at least), used for performance optimizations (#perfmatters)
	 */
	private currentASTDepthToSkip: number;

	/**
	 * Collected nodes which indicate a fosused / ignored test, thus leading to an error
	 */
	private nodesWithForbiddenIdentifier: Array<typescript.Node>;

	/**
	 * Constructor
	 *
	 * @param {string} filePath - Relative path of the file to be checked / analyzed
	 */
	constructor( filePath: string ) {
		this.filePath = filePath;
		this.currentASTDepth = 0;
		this.currentASTDepthToSkip = -1;
		this.nodesWithForbiddenIdentifier = [];
	}

	/**
	 * Analyze for focused / ignored tests
	 *
	 * @returns {Promise<NoSkippedTestsAnalyzerResult>} - Promise, resolves with the results
	 */
	public analyze(): Promise<NoSkippedTestsAnalyzerResult> {
		return new Promise<NoSkippedTestsAnalyzerResult>(
			async( resolve: ( result: NoSkippedTestsAnalyzerResult ) => void, reject: ( error: Error ) => void ) => {

			// Read file (and catch errors)
			let data: any;
			try {
				data = await this.readFile();
			} catch( error ) {
				reject( error );
				return;
			};

			// Create source file
			let sourceFile: typescript.SourceFile;
			try {
				sourceFile = typescript.createSourceFile( path.basename( this.filePath ), data, typescript.ScriptTarget.Latest, true );
			} catch ( error ) {
				reject( error );
				return;
			}

			// Run analysis
			this.analyzeNodeAndChildrenForErrors( sourceFile );

			// Enhance error result
			const errors: Array<NoSkippedTestsAnalyzerError> = [];
			this.nodesWithForbiddenIdentifier.forEach( ( node: typescript.Node ) => {
				const lineAndCharacter: typescript.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition( node.getStart() );
				errors.push( {
					char: lineAndCharacter.character + 1,
					identifier: node.getText(),
					line: lineAndCharacter.line + 1
				} );
			} );

			// Return analysis result
			resolve( {
				filePath: this.filePath,
				errors
			} );

		} );
	}

	/**
	 * Analyze the given node and all its children (if necessary) for nodes resulting in an error
	 *
	 * @param {typescript.Node} currentNode - Current node
	 */
	private analyzeNodeAndChildrenForErrors( currentNode: typescript.Node ): void {

		// One down
		this.currentASTDepth++;

		// Reset the depth to skip value if we have left the the defined depth level
		if ( this.currentASTDepth === this.currentASTDepthToSkip - 1 ) {
			this.currentASTDepthToSkip = -1;
		}

		// Exit early if we want to skip the rest of this depth (#perfmatters)
		if ( this.currentASTDepth === this.currentASTDepthToSkip ) {
			this.currentASTDepth--; // One up
			return;
		}

		// Analyze function / identifier names only
		if ( currentNode.kind === typescript.SyntaxKind.Identifier ) {

			// Check if the function name is in the list of forbidden ones
			const identifierName: string = currentNode.getText();
			if ( forbiddenIdentifiers.indexOf( identifierName ) !== -1 ) {

				// Collect the error node
				this.nodesWithForbiddenIdentifier.push( currentNode );

				// Check if we can skip the rest of this depth level (and all its children) (#perfmatters)
				if ( deepestIdentifiers.indexOf( identifierName ) !== -1 ) {
					this.currentASTDepthToSkip = this.currentASTDepth;
				}

			}

		}

		// Early exit analyzing this AST depth if we've found a test case identifier (which cannot be nested) (#perfmatters)
		if ( this.currentASTDepthToSkip !== this.currentASTDepth ) {
			typescript.forEachChild( currentNode, this.analyzeNodeAndChildrenForErrors.bind( this ) ); // Recursion, keeping 'this' reference
		}

		// One up
		this.currentASTDepth--;

	}

	/**
	 * Read the file, resolve with its content
	 *
	 * @returns {Promise<any>} - Promise, resolved with the file content
	 */
	private readFile(): Promise<any> {
		return new Promise<any>( ( resolve: ( data: any ) => void, reject: ( error: Error ) => void ) => {

			fs.readFile( this.filePath, { encoding: 'UTF-8' }, ( error: Error, data: any ) => {

				// Handle errors
				if ( error ) {
					reject( error );
					return;
				}

				resolve( data );

			} );

		} );
	}

}
