import { NoSkippedTestsAnalyzerError } from './no-skipped-tests-analyzer-error.interface';

/**
 * No skipped tests analyzer result object
 */
export interface NoSkippedTestsAnalyzerResult {
  filePath: string;
  errors: Array<NoSkippedTestsAnalyzerError>;
}
