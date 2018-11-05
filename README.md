# @shabados/database

[![CircleCI](https://img.shields.io/circleci/project/github/ShabadOS/database.svg?style=for-the-badge)](https://circleci.com/gh/ShabadOS/database)
[![Github All Releases](https://img.shields.io/github/downloads/ShabadOS/database/total.svg?style=for-the-badge)](https://github.com/ShabadOS/database/releases)
[![npm (scoped)](https://img.shields.io/npm/v/@shabados/database.svg?style=for-the-badge)](https://www.npmjs.com/package/@shabados/database)
[![David](https://img.shields.io/david/ShabadOS/database.svg?style=for-the-badge)]()
[![license](https://img.shields.io/github/license/ShabadOS/database.svg?style=for-the-badge)]()

> An open-source Gurbani database containing an evolving set of corrections.

Want to speak to us? [![Join us on Slack](https://slack.shabados.com/badge.svg)](https://slack.shabados.com)

**Read the full documentation at https://ShabadOS.github.io/database.**

## Quickstart

Want to use this in your own project? Get it from npm with `npm install @shabados/database`.

An [`Objection.js Model`](http://vincit.github.io/objection.js/) is returned, allowing for flexible and relational querying.

To fetch a Shabad with first letters:

```javascript
const { Lines } = require('@shabados/database')
    
// Fetch the line, with information about the shabad
Lines
  .query() // Start a query on the lines table
  .firstLetters('ਹਹਹਗ')   // Search for the first letters, ordering the results sensibly
  .first()  // Use the first line that is returned
  .then(line => line.$relatedQuery('shabad').eager('[lines, writer]'))  // Return the shabad the line is from, with the lines and writer
  .then(shabad => console.log(shabad))
```

To search in the ascii equivalent, the API will automatically convert the search to unicode:

```javascript
Lines.query().firstLetters('kkggAnj')
```

> Although column names are in `snake_case`, the API returns `camelCase` via [objection.js](http://vincit.github.io/objection.js/#snake-case-to-camel-case-conversion).

# Schema & File Structure

![schema](schema.png)

The schema can be modified in the `migrations/schema.js` file.

JSON files for `Raags`, `Sources`, `Writers`, and `Line_Types` can be found in the `data` folder. Changing a value here will be reflected everywhere else. The `(array index) + 1` represents the id used for each relation in other tables.

Lines of JSON files are split by page or other sensible method via `./data/source/number.json`.

Bani compilations can be added to the `bani.json`. To define the lines it contains, each bani should contain a list of objects with `start_line` and `end_line`, referring to the files in `sources`.

# Build

It is possible to make small changes and build a database from the JSON files and in reverse to make batch changes and build the JSON files from the database.

## Database

You can build an SQLite3 database with the following methods:

**Node.js** - Install [node](https://nodejs.org/). Install dependencies and build with `npm install && npm run build-sqlite`.

**Docker** - Install [docker](http://docker.com). Build with `docker-compose up build-sqlite`. Check the `build` folder.

## JSON

JSON files for `Raags`, `Sources`, `Writers`, and `Line_Types` can be found in the `data` folder.

Shabads are split by `data/[source name]/[page number.json]`, and contain the corresponding lines.

Banis can be added by adding an object to the `data/banis.json` file. To define the lines a bani contains, each bani should contain a list of objects with `start_line` and `end_line`, referring to `line_id`s.

### Single line changes
The content for each ang can be found in the corresponding JSON file. 
Simply change any values as desired.

If `Major bump`, `Minor bump`, `Patch bump` are found in the last commit message, database assets will be compiled and released per semantic versioning.

To modify large parts of the database based on some rule, or rename a value used in many places, such as a writer's name or a language name:
- Build a local copy of the database by running `npm run build-sqlite`
- Modify the database file in `builds/database.sqlite` as you see fit
- Run `npm run build-json` to regenerate the seed files with your changes

# Benchmarks

Run benchmarks with `npm run benchmark` or `docker-compose up benchmark`. Benchmarks depend on specs, but the following shows that between 0-200 results can be returned in a reasonable amount of time.

Query | Results | Time
----- | ------- | ----
ਹਹ | 2748 | ~80ms
ਹਹਹ | 226 | ~50ms
ਹਹਹਹ | 50 | ~50ms
ਹਹਹਹਹ | 13 | ~50ms

# Viewers

You can use an application like [DBeaver](https://dbeaver.jkiss.org/) to view the SQLite file.

# Licenses

Gurbani was written during a time and place without formal copyright laws. Therefore we identify it as being free of known restrictions under copyright law. Gurbani under the `data` folder and generated under the `build` folder, including the `gurmukhi` JSON and SQLite fields, is licensed under a ![PDM](https://i.creativecommons.org/p/mark/1.0/80x15.png) [Creative Commons Public Domain Mark 1.0 License](https://creativecommons.org/publicdomain/mark/1.0/).  

Supporting text under the `data` folder and generated under the `build` folder, are subject to their respective source copyrights, some by other authors. Translations, transliterations, notes, compilations, or other items which are not Gurbani and which are created or uniquely organized by the Shabad OS team are subject to the ![CC By-SA](https://i.creativecommons.org/l/by-sa/4.0/80x15.png) [Creative Commons Attribution-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-sa/4.0/).

Code and content resting outside of the `data` and `build` folders is licensed under the <img src="https://www.gnu.org/graphics/gplv3-88x31.png" height="15"> [GNU General Public License V3](https://www.gnu.org/licenses/gpl.html).

All code and content resting outside of the `data` and `build` folders is licensed under the [GNU General Public License V3](LICENSE.md).
