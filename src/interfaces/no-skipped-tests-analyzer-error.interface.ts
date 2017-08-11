/**
 * Error object as the result of the no skipped tests analsis
 */
export interface NoSkippedTestsAnalyzerError {
	char: number;
	identifier: string;
	line: number;
};
