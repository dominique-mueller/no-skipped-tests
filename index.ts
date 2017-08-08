import { readFileSync, readFile } from 'fs';

import { createSourceFile, forEachChild, Node, ScriptTarget, SourceFile, SyntaxKind } from 'typescript';
import * as chalk from 'chalk';
import * as glob from 'glob';
import * as figures from 'figures';

// TODO: Verbose output

const forbiddenIdentifiers: Array<string> = [
	'fdescribe',
	'xdescribe',
	'fit',
	'xit'
];
const skipIdentifiers: Array<string> = [
	'it',
	'fit',
	'xit'
];

// TODO: Wrap the following in a function

export class NoSkippedTestsAnalyzer {

	private filePath: string;
	private currentDepth: number;
	private currentDepthToSkipTheRestOf: number;
	private errorNodes: Array<Node>;

	constructor( filePath: string ) {
		this.currentDepth = 0;
		this.currentDepthToSkipTheRestOf = -1;
		this.errorNodes = [];
		this.filePath = filePath;
	}

	public analyze(): Promise<any> {
		return new Promise<any>( ( resolve, reject ) => {

			readFile( this.filePath, { encoding: 'UTF-8' }, ( error, fileContent ) => {

				// TODO: Handle error
				// console.log( error );

				// Read file as source file, then start analysis
				const sourceFile: SourceFile = createSourceFile( this.filePath, fileContent, ScriptTarget.Latest, true );
				this.analyzeNodesRecursively( sourceFile );

				const errors: Array<any> = [];
				this.errorNodes.forEach( ( node ) => {
					const { line, character } = sourceFile.getLineAndCharacterOfPosition( node.getStart() );
					errors.push( {
						identifier: node.getText(),
						line: line + 1,
						char: character
					} );
				} );

				resolve( {
					file: this.filePath,
					errors
				} );

			} );

		} );
	}

	private analyzeNodesRecursively( currentNode: Node ) {

		// One depth down
		this.currentDepth = this.currentDepth + 1;

		// Reset the depth skip value if we've left the the corresponding depth level (upwards)
		if ( this.currentDepth === this.currentDepthToSkipTheRestOf - 1 ) {
			this.currentDepthToSkipTheRestOf = -1;
		}

		// Exit early if we want to skip the rest of this depth (##perfmatters)
		if ( this.currentDepth === this.currentDepthToSkipTheRestOf ) {
			this.currentDepth--;
			return;
		}

		// Analyze function / identifier names only
		if ( currentNode.kind === SyntaxKind.Identifier ) {

			// Check if the function name is in the list of forbidden ones
			const identifierName: string = currentNode.getText();
			if ( forbiddenIdentifiers.indexOf( identifierName ) !== -1 ) {

				this.errorNodes.push( currentNode );

				// Check if we can skip the rest of this depth level (and all its children) (#perfmatters)
				if ( skipIdentifiers.indexOf( identifierName ) !== -1 ) {
					this.currentDepthToSkipTheRestOf = this.currentDepth;
				}

			}

		}

		// Early exit analyzing this AST depth if we've found a test case identifier (which cannot be nested)
		if ( this.currentDepthToSkipTheRestOf !== this.currentDepth ) {
			forEachChild( currentNode, this.analyzeNodesRecursively.bind( this ) ); // Recursion
		}

		// One depth up again
		this.currentDepth--;

	}

}

export function processResults( errors: any ) {

	console.log( '' );

	let numberOfErrors: number = 0;
	errors.forEach( ( error ) => {

		const filePathSegments: Array<string> = error.file.split( '/' );
		const fileName: string = filePathSegments.pop();
		const filePath: string = `${ filePathSegments.join( '/' ) }/`;
		if ( error.errors.length === 0 ) {
			console.log( chalk.white.bgGreen( ' PASS ' ), `${ chalk.gray( filePath ) }${ chalk.white( fileName ) }` );
		} else {
			console.log( '' );
			console.log( chalk.white.bgRed( ' FAIL ' ), `${ chalk.gray( filePath ) }${ chalk.white( fileName ) }` );
			error.errors.forEach( ( errorDetails ) => {
				numberOfErrors++;
				console.log( chalk.red( `       ${ figures.pointer } Found "${ errorDetails.identifier }" in line ${ errorDetails.line }:${ errorDetails.char }` ) );
			} );
			console.log( '' );
		}

	} );

	console.log( '' );

	if ( numberOfErrors === 0 ) {
		console.log( 'Summary: Everything is fine!' );
		console.log( '' );
		process.exit( 0 );
	} else {
		console.log( `Summary: Detected ${ numberOfErrors } errors!` );
		console.log( '' );
		process.exit( 1 );
	}

}

glob( '**/*.spec.ts', ( error, files ) => {

	console.log( '' );
	console.log( 'Checking for skipped tests ...' );

	// TODO: Catch errors
	// TODO: Catch 0 files

	// Analyze all files (asynchronously, #perfmatters)
	const promises: Array<Promise<any>> = [];
	files.forEach( ( filePath: string ) => {
		const analyzer: NoSkippedTestsAnalyzer = new NoSkippedTestsAnalyzer( filePath );
		promises.push( analyzer.analyze() );
	} );

	Promise
		.all( promises )
		.then( ( errors: Array<any> ) => {
			processResults( errors );
		} );

} );
