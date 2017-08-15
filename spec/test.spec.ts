import { analyzeFilesForSkippedTests } from './../index';

describe( 'No Skipped Tests Analyzer', () => {

	it( 'should not find any errors (TS)', ( done ) => {

		analyzeFilesForSkippedTests( {
			log: false,
			pattern: 'spec/examples/no-errors/*.spec.ts'
		} ).then( ( results ) => {

			expect( results ).toEqual( [
				{
					errors: [],
					filePath: 'spec/examples/no-errors/one.spec.ts'
				},
				{
					errors: [],
					filePath: 'spec/examples/no-errors/two.spec.ts'
				}
			] );
			done();

		} );

	} );

	it( 'should not find any errors (JS)', ( done ) => {

		analyzeFilesForSkippedTests( {
			log: false,
			pattern: 'spec/examples/no-errors/*.spec.js'
		} ).then( ( results ) => {

			expect( results ).toEqual( [
				{
					errors: [],
					filePath: 'spec/examples/no-errors/one.spec.js'
				},
				{
					errors: [],
					filePath: 'spec/examples/no-errors/two.spec.js'
				}
			] );
			done();

		} );

	} );

	it( 'should find all "it"-related errors (TS)', ( done ) => {

		analyzeFilesForSkippedTests( {
			log: false,
			pattern: 'spec/examples/it-errors/*.spec.ts'
		} ).then( ( results ) => {

			expect( results ).toEqual( [
				{
					errors: [ // Only one error in file
						{ char: 2, identifier: 'fit', line: 7 }
					],
					filePath: 'spec/examples/it-errors/one.spec.ts'
				},
				{
					errors: [ // Multiple errors in file
						{ char: 3, identifier: 'xit', line: 17 },
						{ char: 3, identifier: 'xit', line: 21 }
					],
					filePath: 'spec/examples/it-errors/two.spec.ts'
				}
			] );
			done();

		} );

	} );

	it( 'should find all "it"-related errors (JS)', ( done ) => {

		analyzeFilesForSkippedTests( {
			log: false,
			pattern: 'spec/examples/it-errors/*.spec.js'
		} ).then( ( results ) => {

			expect( results ).toEqual( [
				{
					errors: [ // Only one error in file
						{ char: 2, identifier: 'fit', line: 7 }
					],
					filePath: 'spec/examples/it-errors/one.spec.js'
				},
				{
					errors: [ // Multiple errors in file
						{ char: 3, identifier: 'xit', line: 17 },
						{ char: 3, identifier: 'xit', line: 21 }
					],
					filePath: 'spec/examples/it-errors/two.spec.js'
				}
			] );
			done();

		} );

	} );

	it( 'should find all "describe"-related errors (TS)', ( done ) => {

		analyzeFilesForSkippedTests( {
			log: false,
			pattern: 'spec/examples/describe-errors/*.spec.ts'
		} ).then( ( results ) => {

			expect( results ).toEqual( [
				{
					errors: [ // Top hierarchy
						{ char: 1, identifier: 'fdescribe', line: 1 }
					],
					filePath: 'spec/examples/describe-errors/one.spec.ts'
				},
				{
					errors: [ // Nested
						{ char: 2, identifier: 'xdescribe', line: 15 }
					],
					filePath: 'spec/examples/describe-errors/two.spec.ts'
				}
			] );
			done();

		} );

	} );

	it( 'should find all "describe"-related errors (JS)', ( done ) => {

		analyzeFilesForSkippedTests( {
			log: false,
			pattern: 'spec/examples/describe-errors/*.spec.js'
		} ).then( ( results ) => {

			expect( results ).toEqual( [
				{
					errors: [ // Top hierarchy
						{ char: 1, identifier: 'fdescribe', line: 1 }
					],
					filePath: 'spec/examples/describe-errors/one.spec.js'
				},
				{
					errors: [ // Nested
						{ char: 2, identifier: 'xdescribe', line: 15 }
					],
					filePath: 'spec/examples/describe-errors/two.spec.js'
				}
			] );
			done();

		} );

	} );

	it( 'should find no errors when the given pattern matches no files', ( done ) => {

		analyzeFilesForSkippedTests( {
			log: false,
			pattern: 'spec/examples/does-not-exist/*.spec.ts'
		} ).then( ( results ) => {

			expect( results ).toEqual( [] );
			done();

		} );

	} );

} );
