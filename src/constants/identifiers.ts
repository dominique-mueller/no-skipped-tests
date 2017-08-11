/**
 * List of forbidden identifiers
 */
export const forbiddenIdentifiers: Array<string> = [ // TODO: Check frameworks!
	'fdescribe',
	'xdescribe',
	'fit',
	'xit'
];

/**
 * List of identifiers that are the deepest one we are interested in (used for performance enhancements)
 */
export const deepestIdentifiers: Array<string> = [ // TODO: Check frameworks!
	'it',
	'fit',
	'xit'
];
