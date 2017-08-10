import * as fs from 'fs';
import * as path from 'path';

import * as typescript from 'typescript';

// TODO: Check frameworks!!
export const forbiddenIdentifiers: Array<string> = [
	'fdescribe',
	'xdescribe',
	'fit',
	'xit'
];
export const lastInterestingIdentifiers: Array<string> = [
	'it',
	'fit',
	'xit'
];

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
		this.filePath = filePath; // TODO: Check? File ending?
		this.currentASTDepth = 0;
		this.currentASTDepthToSkip = -1;
		this.nodesWithForbiddenIdentifier = [];
	}

	/**
	 * Analyze for focused / ignored tests
	 *
	 * @returns {Promise<any>} - Promise, resolved with the results
	 */
	public analyze(): Promise<any> {
		return new Promise<any>( async( resolve: ( result: any ) => void, reject: () => void ) => {

			// Read file as source file, then start analysis
			const data: any = await this.readFile();
			const fileName: string = path.basename( this.filePath );
			const fileDirectory: string = path.dirname( this.filePath );
			const sourceFile: typescript.SourceFile = typescript.createSourceFile( fileName, data, typescript.ScriptTarget.Latest, true );
			this.analyzeNodeAndChildrenForErrors( sourceFile );

			// Enhance error result
			const errors: Array<any> = [];
			this.nodesWithForbiddenIdentifier.forEach( ( node ) => {
				const lineAndCharacter: typescript.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition( node.getStart() );
				errors.push( {
					char: lineAndCharacter.character,
					identifier: node.getText(),
					line: lineAndCharacter.line++
				} );
			} );

			// Return analysis result
			resolve( {
				filePath: this.filePath,
				fileName,
				fileDirectory,
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
				if ( lastInterestingIdentifiers.indexOf( identifierName ) !== -1 ) {
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
		return new Promise<any>( ( resolve: ( data: any ) => void, reject: () => void ) => {

			fs.readFile( this.filePath, { encoding: 'UTF-8' }, ( error: NodeJS.ErrnoException, data: any ) => {

				if ( error ) {
					// TODO: Handle error
					return;
				}

				// setTimeout( () => { // TODO: Remove me
				resolve( data );
				// }, Math.floor( Math.random() * 1000 ) + 0 );

			} );

		} );
	}

}
