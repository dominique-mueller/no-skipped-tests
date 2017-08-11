
describe( () => {

	beforeEach( () => {
		console.log( 'TEST TEST TEST' );
	} );

	it( 'should instantiate', () => {

		const something: number = 42;

		expect( 'test' ).toBe( 'test' );

	} );

	fit( 'something else', () => {

		let hey: string = 'HEY';

		expect( true ).toBe( true );

	} );

} );
