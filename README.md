<div align="center">

# no-skipped-tests

**Analyzes your project for focused or ignored tests**

</div>

<br><br>

## What it does

Have you ever committed focused or ignored tests by accident? Do you always forget to remove those `fdescribe` or `xit` statements?

The **no-skipped-tests** is here to help; it is a NodeJS-based command line tool which checks your tests for focused or ignored test suites and test cases. Once integrated in your Continuos Integration Platform, we can make sure all the tests are being executed with every build.

![No Skipped Tests Success Preview](/docs/preview-success.png?raw=true)

![No Skipped Tests Error Preview](/docs/preview-error.png?raw=true)

<br><br><br>

## How to install

You can get **no-skipped-tests** via **npm** by either adding it as a new devDependency to your `package.json` file and running
`npm install`, or running the following command:

```bash
npm install no-skipped-tests --save-dev
```

**Requirements**

- **no-skipped-tests** requires **NodeJS 10** (or higher) to be installed

<br><br><br>

## How to use

The most common way to use **no-skipped-tests** is adding it to the scripts area within your `package.json` file. For example:

```json
{
  "scripts": {
    "no-skipped-tests": "no-skipped-tests"
  }
}
```

Then, execute it by running:

```bash
npm run no-skipped-tests
```

You can also let npm run **no-skipped-tests** automatically before every test execution by using the `pretest` script:

```json
{
  "scripts": {
    "pretest": "no-skipped-tests"
  }
}
```

Alternatively, if you want to run **no-skipped-tests** from scratch, you can use an `npx` command:

```bash
npx no-skipped-tests
```

<br>

### Configuration

By default, **no-skipped-tests** will analyze all test files within your source folder: `src/**/*.spec.@(ts|js)`. However, your project
might have a different naming convention or directory structure. Thus, you might provide a custom file pattern instead. For instance:

```json
{
  "scripts": {
    "pretest": "no-skipped-tests src/app/**/*.test.ts"
  }
}
```
