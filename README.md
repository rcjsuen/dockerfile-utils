# Dockerfile Utilities

[![Build Status](https://travis-ci.org/rcjsuen/dockerfile-utils.svg?branch=master)](https://travis-ci.org/rcjsuen/dockerfile-utils) [![Coverage Status](https://coveralls.io/repos/github/rcjsuen/dockerfile-utils/badge.svg?branch=master)](https://coveralls.io/github/rcjsuen/dockerfile-utils?branch=master) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

This is a collection of utilities for working with Dockerfiles powered by Node.js written in TypeScript.
To [install and run](#installation-instructions) these utilities, you will need to have [Node.js](https://nodejs.org/en/download/).

Supported features:
- formatting
- linting

## Development Instructions

If you wish to build and compile this project, you must first install [Node.js](https://nodejs.org/en/download/) if you have not already done so.
After you have installed Node.js and cloned the repository with Git, you may now proceed to build and compile the project with the following commands:

```
npm install
npm run build
npm test
```

If you are planning to change the code, use `npm run watch` to get the TypeScript files transpiled on-the-fly as they are modified.

## Installation Instructions

To add this library as a dependency to your project, please add `dockerfile-utils` as a dependency in your project's package.json file.

To install and use the `dockerfile-utils` command line interface, please install the [dockerfile-utils npm module](https://www.npmjs.com/package/dockerfile-utils).
The `-g` flag will install the NPM module globally onto your computer.

```
npm install -g dockerfile-utils
```

After the installation has completed, you can run the CLI using the `dockerfile-utils` binary.

```
> dockerfile-utils --help
Usage: dockerfile-utils <command> [<args>]

Options:

  -h, --help                Output usage information
  -v, --version             Output version information

Commands:

  format                    Format a Dockerfile
  lint                      Validate a Dockerfile
```
