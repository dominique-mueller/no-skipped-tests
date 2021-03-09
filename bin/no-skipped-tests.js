#!/usr/bin/env node

'use strict';

const analyzeFilesForSkippedTests = require('./../index').analyzeFilesForSkippedTests;

// Collect command line parameters (only source pattern for now)
const parameters = process.argv.slice(2);
const options = {};
if (parameters.length > 0) {
  options.pattern = parameters[0];
}

// MAIN
console.log('');
analyzeFilesForSkippedTests(options)
  .then((results) => {
    console.log('');
    const hasErrors = results
      .map((result) => {
        return result.errors.length;
      })
      .reduce((a, b) => {
        return a + b;
      });
    process.exit(hasErrors ? 1 : 0);
  })
  .catch((error) => {
    console.log('');
    process.exit(1);
  });
