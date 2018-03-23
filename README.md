# @shabados/database
An open gurbani database containing an evolving set of corrections. Used in Shabad OS software.

[![CircleCI](https://img.shields.io/circleci/project/github/ShabadOS/database.svg?style=for-the-badge)](https://circleci.com/gh/ShabadOS/database)
[![Github All Releases](https://img.shields.io/github/downloads/ShabadOS/database/total.svg?style=for-the-badge)](https://github.com/ShabadOS/database/releases)
[![npm (scoped)](https://img.shields.io/npm/v/@shabados/database.svg?style=for-the-badge)](https://www.npmjs.com/package/@shabados/database)
[![David](https://img.shields.io/david/ShabadOS/database.svg?style=for-the-badge)]()
[![license](https://img.shields.io/github/license/ShabadOS/database.svg?style=for-the-badge)]()

An open Gurbani database containing an evolving set of corrections. Used in Shabad OS software.

Want to speak to us? [![Join us on Slack](https://slack.shabados.com/badge.svg)](https://slack.shabados.com)

## Quickstart

Want to use this in your own project? Get it from npm with `npm install @shabados/database`.

An `objection.js` object is returned, allowing for flexible and relational querying.

To fetch a Shabad with first letters:

```javascript
// const { Lines } = require('@shabados/database') // If using npm module
const { Lines } = require('./index') // If using this repo
    
// Fetch the line, with information about the shabad
Lines
  .query()                        // Setup a query builder
  .firstLetters('ਹਹਹਗ')           // Add a search for the provided first letters
  .eager('shabad')                // Fetch the shabad the lines are related to
  .first()                        // Return only the first line found
  .then(line => Lines.query().where('shabad_id', '=', line.shabad_id))
  .then(lines => console.log(lines))
```

You can also search the ascii equivalent, and the API will automatically convert the search to unicode:
```javascript
Lines.query().firstLetters('kkggAnj')
```

## Vague Benchmarks

- `ਹਹ` yielded `2748` results in `~200ms`
- `ਹਹਹ` yielded `226` results in `~100ms`
- `ਹਹਹਹ` yielded `50` results in `~85ms`
- `ਹਹਹਹਹ` yielded `13` results in `~85ms`

Obviously, YMMV depending on specs, but this does show that
it's probably ok to return between 0-200 results in a reasonable amount of time.


## Schema

![schema](schema.png)

## Building

You can use docker, or node.

### Docker

Install [docker](http://docker.com). You won't need to install anything else.

Run `docker-compose up build` to generate the SQLite3 DB in the `build` folder.

### Node

Install [node](https://nodejs.org/). 

Run `npm install` inside the project directory to install dependencies.

Run `npm run build` to build the database.

## Contributing

The schema can be modified in the `migrations/schema.js` file.

### Structure

JSON files for `Raags`, `Sources`, `Writers`, and `Line_Types` can be found in the `seeds` folder.
Changing a value here will be reflected everwhere else. The `(array index) + 1` represents the id used
for each relation in other tables.

Lines are split by `sources/source name/first ang in batch/ang number.json`.

Banis can be added by adding a named JSON file to the `banis` folder. To define the lines a bani contains, each bani should contain a list of objects with `start_line` and `end_line`, referring to the files in `sources`. Note that for now, these lines have to be updated if new lines are added or removed from the source files. 

Shabads are split by `shabads/source name/writer name.json`.


### Single line changes
The content for each ang can be found in the corresponding js file. 
Simply change any values as desired.

### Large/batch changes

To modify large parts of the database, based on some rule:
- Build a local copy of the database, following the instructions in the Building section
- Modify the database file in `builds/database.sqlite` as you see fit
- Run `docker-compose up generate` or `npm run generate` to regenerate the seed files with your changes

## Releases

The builds for any of branches can be found on [CircleCI](https://circleci.com/gh/ShabadOS).

If `MAJOR`, `MINOR` are found in any of the commit messages, the version will be adjusted as per
semantic versioning (`PATCH` is assumed if none of the above are found).

Compiled databases are available via the release page, or via `npm install @shabados/database`.
      
## Viewing

You can use an application like [DBeaver](https://dbeaver.jkiss.org/) to view the SQLite file.

## Todo

- Redo English translations under an open license
- Automatically update the Bani files if a line change in sources occurs
