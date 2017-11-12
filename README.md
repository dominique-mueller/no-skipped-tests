<div align="center">

# no-skipped-tests

**Automates the release process for GitHub projects.**

[![npm version](https://img.shields.io/npm/v/no-skipped-tests.svg?maxAge=3600&style=flat)](https://www.npmjs.com/package/no-skipped-tests)
[![dependency status](https://img.shields.io/david/dominique-mueller/no-skipped-tests.svg?maxAge=3600&style=flat)](https://david-dm.org/dominique-mueller/no-skipped-tests)
[![travis ci build status](https://img.shields.io/travis/dominique-mueller/no-skipped-tests/master.svg?maxAge=3600&style=flat)](https://travis-ci.org/dominique-mueller/no-skipped-tests)
[![Codecov](https://img.shields.io/codecov/c/github/dominique-mueller/no-skipped-tests.svg?maxAge=3600&style=flat)](https://codecov.io/gh/dominique-mueller/no-skipped-tests)
[![Known Vulnerabilities](https://snyk.io/test/github/dominique-mueller/no-skipped-tests/badge.svg)](https://snyk.io/test/github/dominique-mueller/no-skipped-tests)
[![license](https://img.shields.io/npm/l/no-skipped-tests.svg?maxAge=3600&style=flat)](https://github.com/dominique-mueller/no-skipped-tests/LICENSE)

</div>

<br><br>

## What it does

Have you ever committed focused or ignored tests by accident? Do you always forget to remove those `fdescribe` or `xit` statements?

The **no-skipped-tests** is here to help; it is a NodeJS-based command line tool which checks your tests for focused or ignored test suites and test cases. Once integrated in your Continuos Integration Platform, we can make sure all the tests are being executed with every build.

TODO: IMAGE

<br><br>

## How to install

You can get **no-skipped-tests** via **npm** by either adding it as a new devDependency to your `package.json` file and running
`npm install`, or running the following command:

``` bash
npm install no-skipped-tests --save-dev
```

### Requirements

- **no-skipped-tests** requires at least **NodeJS 7.6** (or higher). *Earlier 7.x versions of NodeJS (7.0 to 7.5) might also work when
executing **no-skipped-tests** using the `--harmony-async-await` flag.*

<br><br>

## How to use

Using **no-skipped-tests** is very straightforward: Simply call it within one of the scripts of your `package.json` file. For instance, you
can let it get executed automatically before every test by using the `pretest` script:

``` json
{
  "scripts": {
    "pretest": "no-skipped-tests"
  }
}
```

Alternatively, you can also run it manually:

``` bash
npm run pretest
```

### Configure test files

By default, **no-skipped-tests** will analyue all test files within your source folder: `src/**/*.spec.@(ts|js)`. However, your project
might have a different naming convention or directory structure. Thus, you might provide a custom file pattern instead. For instance:

``` json
{
  "scripts": {
    "pretest": "no-skipped-tests src/app/**/*.test.ts"
  }
}
```

<br><br>

## Creator

**Dominique Müller**

- E-Mail: **[dominique.m.mueller@gmail.com](mailto:dominique.m.mueller@gmail.com)**
- Website: **[www.devdom.io](https://www.devdom.io/)**
- Twitter: **[@itsdevdom](https://twitter.com/itsdevdom)**
