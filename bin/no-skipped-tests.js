#!/usr/bin/env node

'use strict';

const chalk = require( 'chalk' );

const analyzeFilesForSkippedTests = require( './../dist/index' ).analyzeFilesForSkippedTests;

// Collect command line parameters (only source pattern for now)
const parameters = process.argv.slice( 2 );
const options = {};
if ( parameters.length > 0 ) {
	options.pattern = parameters[ 0 ];
}

// MAIN
console.log( '' );
analyzeFilesForSkippedTests( options )
	.then( ( results ) => {
		console.log( '' );
		if ( results.length === 0 ) {
			process.exit( 0 );
		} else {
			process.exit( 1 );
		}
	} )
	.catch( ( error ) => {
		console.log( '' );
		process.exit( 1 );
	} );
