lokki-server [![Build Status](https://travis-ci.org/TheSoftwareFactory/lokki-server.svg?branch=master)](https://travis-ci.org/TheSoftwareFactory/lokki-server)
============

Backend code (API server) for the Lokki project.

## Development

For developing the software, you will need:
- Recent version of [node.js](http://nodejs.org/) (tested with 0.10.33) – the distribution includes npm, which you will also need
- Recent version of [Redis](http://redis.io/) – follow installation and running instructions on Redis website

After these dependencies are installed, go to repository root and run:

    $ npm install

This will install JavaScript dependencies of the project. If you have your Redis server running (on default port), you can run server with:

    $ node lokki-server.js

Server can be run with different configurations by setting `NODE_ENV` environment variable (`development` is used by default). For example:

    $ NODE_ENV=production node lokki-server.js

Server loads matching configuration from `config/` directory – see `lib/config.js` for details about all available configuration options.

Tests can be run with (always uses `NODE_ENV=test`):

    $ node unittest-runner.js

See the [Lokki main repository](https://github.com/TheSoftwareFactory/lokki) for more information on development.

### Coding style

[eslint](http://eslint.org/) is used to spot mistakes and to make sure coding style is consistent. Rules used in addition to default rules can be found from `.eslintrc`. Any eslint errors will fail the Travis CI build.

During development, easiest way is to make sure you won't have eslint errors is to have eslint integration in your IDE or text editor. Sublime Text 3 supports this with [SublimeLinter-eslint](https://github.com/roadhump/SublimeLinter-eslint). You can also put `eslint .` to your Git pre-commit hook to make sure you won't make commits that have lint errors.

## Files

Some files and directories of interest include:

- `lokki-server.js`: Node.js + express app, exposing REST API. You can run the application with `node lokki-server.js`.
- `unittest-runner.js`: Unit test runner. Unit tests are run with `node unittest-runner.js` command.
- `lib/dbSetup.js`: Setting up database for testing.
- `locmap/`: Folder containing logic related to location sharing.
    - `locmap/locmap-server.js`: REST API for locmap
    - `locmap/test`: Tests for locmap
- `test/`: General tests

## Note

Lokki is available to the open source community under Apache v2 license AS IS.
