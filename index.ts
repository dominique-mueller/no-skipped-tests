import * as chalk from 'chalk';

import { main } from './src/main';

// MAIN
console.log( '' );
main()
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
