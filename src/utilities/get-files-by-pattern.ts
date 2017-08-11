import * as glob from 'glob';

/**
 * Get a list of files based on the given pattern
 *
 * @param   {string}                 pattern - Glob pattern (see <https://github.com/isaacs/node-glob#glob-primer> for further details)
 * @returns {Promise<Array<string>>}         - Promise, resolves with the list of relative file paths (which can by empty)
 */
export function getFilesByPattern( pattern: string ): Promise<Array<string>> {
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
