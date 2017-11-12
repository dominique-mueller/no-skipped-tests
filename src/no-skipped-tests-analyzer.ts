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
	public async analyze(): Promise<NoSkippedTestsAnalyzerResult> {

		// Read file (and catch errors)
		let fileContent: string;
		try {
			fileContent = await this.readFile();
		} catch ( error ) {
			throw new Error( error.message );
		};

		// Create source file
		let sourceFile: typescript.SourceFile;
		try {
			sourceFile = typescript.createSourceFile( path.basename( this.filePath ), fileContent, typescript.ScriptTarget.Latest, true );
		} catch ( error ) {
			throw new Error( error.message );
		}

		// Run analysis
		this.analyzeNodeAndChildrenForErrors( sourceFile );

		// Enhance results
		const errors: Array<NoSkippedTestsAnalyzerError> = [];
		this.nodesWithForbiddenIdentifier.forEach( ( node: typescript.Node ): void => {
			const lineAndCharacter: typescript.LineAndCharacter = sourceFile.getLineAndCharacterOfPosition( node.getStart() );
			errors.push( {
				char: lineAndCharacter.character + 1,
				identifier: node.getText(),
				line: lineAndCharacter.line + 1
			} );
		} );

		// Return analysis result
		return {
			filePath: this.filePath,
			errors
		};

	}

	/**
	 * Analyze the given node and all its children (if necessary) for nodes resulting in an error
	 *
	 * @param {typescript.Node} currentNode - Current node
	 */
	private analyzeNodeAndChildrenForErrors( currentNode: typescript.Node ): void {

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

		// Check if the current node is function and its name is in the list of forbidden ones
		if ( currentNode.kind === typescript.SyntaxKind.Identifier && forbiddenIdentifiers.indexOf( currentNode.getText() ) !== -1 ) {

			// Collect the error node
			this.nodesWithForbiddenIdentifier.push( currentNode );

			// Check if we can skip the rest of this depth level (and all its children) (#perfmatters)
			if ( deepestIdentifiers.indexOf( currentNode.getText() ) !== -1 ) {
				this.currentASTDepthToSkip = this.currentASTDepth;
			}

		}

		// Early exit analyzing this AST depth if we've found a test case identifier (which cannot be nested) (#perfmatters)
		if ( this.currentASTDepthToSkip !== this.currentASTDepth ) {
			typescript.forEachChild( currentNode, this.analyzeNodeAndChildrenForErrors.bind( this ) ); // Recursion, keeping 'this' reference
		}

		this.currentASTDepth--;

	}

	/**
	 * Read the file, resolve with its content
	 *
	 * @returns {Promise<string>} - Promise, resolved with the file content
	 */
	private readFile(): Promise<string> {
		return new Promise<string>( ( resolve: ( data: any ) => void, reject: ( error: Error ) => void ): void => {
			fs.readFile( this.filePath, 'utf-8', ( error: Error, data: string ) => {
				if ( error ) {
					reject( error );
					return;
				}
				resolve( data );
			} );
		} );
	}

}
