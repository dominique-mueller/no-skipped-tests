import { analyzeFilesForSkippedTests } from './../index';
import { NoSkippedTestsAnalyzerResult } from '../src/interfaces/no-skipped-tests-analyzer-result.interface';

/**
 * No Skipped Tests Analyzer - Unit Test
 */
describe( 'No Skipped Tests Analyzer', () => {

	beforeAll( () => {

		// Hide all logging output
		spyOn( console, 'log' );
		spyOn( console, 'warn' );
		spyOn( console, 'error' );

	} );

	it( 'should not find any errors (TypeScript)', async() => {

		const results: Array<NoSkippedTestsAnalyzerResult> = await analyzeFilesForSkippedTests( {
			pattern: 'test/examples/no-errors/*.spec.ts'
		} );

		expect( results ).toEqual( [
			{
				errors: [],
				filePath: 'test/examples/no-errors/one.spec.ts'
			},
			{
				errors: [],
				filePath: 'test/examples/no-errors/two.spec.ts'
			}
		] );

	} );

	it( 'should not find any errors (JavaScript)', async() => {

		const results: Array<NoSkippedTestsAnalyzerResult> = await analyzeFilesForSkippedTests( {
			pattern: 'test/examples/no-errors/*.spec.js'
		} );

		expect( results ).toEqual( [
			{
				errors: [],
				filePath: 'test/examples/no-errors/one.spec.js'
			},
			{
				errors: [],
				filePath: 'test/examples/no-errors/two.spec.js'
			}
		] );

	} );

	it( 'should find all "it"-related errors (TypeScript)', async() => {

		const results: Array<NoSkippedTestsAnalyzerResult> = await analyzeFilesForSkippedTests( {
			pattern: 'test/examples/it-errors/*.spec.ts'
		} );

		expect( results ).toEqual( [
			{
				errors: [ // Only one error in file
					{ char: 2, identifier: 'fit', line: 7 }
				],
				filePath: 'test/examples/it-errors/one.spec.ts'
			},
			{
				errors: [ // Multiple errors in file
					{ char: 3, identifier: 'xit', line: 17 },
					{ char: 3, identifier: 'xit', line: 21 }
				],
				filePath: 'test/examples/it-errors/two.spec.ts'
			}
		] );

	} );

	it( 'should find all "it"-related errors (JavaScript)', async() => {

		const results: Array<NoSkippedTestsAnalyzerResult> = await analyzeFilesForSkippedTests( {
			pattern: 'test/examples/it-errors/*.spec.js'
		} );

		expect( results ).toEqual( [
			{
				errors: [ // Only one error in file
					{ char: 2, identifier: 'fit', line: 7 }
				],
				filePath: 'test/examples/it-errors/one.spec.js'
			},
			{
				errors: [ // Multiple errors in file
					{ char: 3, identifier: 'xit', line: 17 },
					{ char: 3, identifier: 'xit', line: 21 }
				],
				filePath: 'test/examples/it-errors/two.spec.js'
			}
		] );

	} );

	it( 'should find all "describe"-related errors (TypeScript)', async() => {

		const results: Array<NoSkippedTestsAnalyzerResult> = await analyzeFilesForSkippedTests( {
			pattern: 'test/examples/describe-errors/*.spec.ts'
		} );

		expect( results ).toEqual( [
			{
				errors: [ // Top hierarchy
					{ char: 1, identifier: 'fdescribe', line: 1 }
				],
				filePath: 'test/examples/describe-errors/one.spec.ts'
			},
			{
				errors: [ // Nested
					{ char: 2, identifier: 'xdescribe', line: 15 }
				],
				filePath: 'test/examples/describe-errors/two.spec.ts'
			}
		] );

	} );

	it( 'should find all "describe"-related errors (JavaScript)', async() => {

		const results: Array<NoSkippedTestsAnalyzerResult> = await analyzeFilesForSkippedTests( {
			pattern: 'test/examples/describe-errors/*.spec.js'
		} );

		expect( results ).toEqual( [
			{
				errors: [ // Top hierarchy
					{ char: 1, identifier: 'fdescribe', line: 1 }
				],
				filePath: 'test/examples/describe-errors/one.spec.js'
			},
			{
				errors: [ // Nested
					{ char: 2, identifier: 'xdescribe', line: 15 }
				],
				filePath: 'test/examples/describe-errors/two.spec.js'
			}
		] );

	} );

	it( 'should find no errors when the given pattern matches no files', async() => {

		const results: Array<NoSkippedTestsAnalyzerResult> = await analyzeFilesForSkippedTests( {
			pattern: 'test/examples/does-not-exist/*.spec.ts'
		} );

		expect( results ).toEqual( [] );

	} );

} );
