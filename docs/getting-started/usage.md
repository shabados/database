# Usage

This section outlines methods of using of the database, and goes through some examples.

There are several methods of using the database, depending on your purpose:
- [**General Browsing/Querying**](#general-browsingquerying): Use an application such as [DBeaver](https://dbeaver.io/) to query the  [SQLite database](https://github.com/ShabadOS/database/releases)
- [**Offline App**](#offline-applications-sqlite): Download the [SQLite database](https://github.com/ShabadOS/database/releases)
- [**Offline JavaScript App (recommended)**](#offline-applications-javascript): Install the [API via npm](installation#npm)
- [**Online App**](#online-applications-gurbaninow-api): Use the [GurbaniNow API](https://github.com/GurbaniNow/api)

## General Browsing/Querying
If you're interested in the contents of the database, start by downloading the latest
[SQLite database release](https://github.com/ShabadOS/database/releases), and an SQLite browser such as [DBeaver](https://dbeaver.io/).

Once installed, open the `Database > New Connection` dialog. Select the `SQLite` type from the list, and press `Next`. On the following screen, press the `Browse` button and select the Shabad OS database file that you previously downloaded, and proceed through the next screens until wizard is complete.

A new database entry will appear under the `Database Navigator` tab, and double-clicking this will open the database. Expand the `tables` option to view all the tables in the database, and double-click on any of the tables to view the data. You may also run some of the [SQL queries](#Offline-Applications-SQLite) and explore the dataset further.

## Offline Applications - SQLite
If you're building a mobile app or desktop application, you'll likely want an offline copy of the database, unless you're certain your users will always be connected to the internet.

You can download the latest [SQLite database release](https://github.com/ShabadOS/database/releases) and query against it using your language's SQLite library.

!> This option will mean that you will have to check the Shabad OS Database release page for updates yourself. If you are building an application in JavaScript, please see the [Offline Applications - JavaScript](#Offline-Applications-JavaScript) section below.

Some common SQL queries have been provided below:

### Common SQL Query Examples

#### Given some first letters, retrieve any matching Lines
```sql
SELECT * FROM lines WHERE first_letters LIKE '%hhhh%' ORDER BY order_id
```

`hhhh` is starting letters of the first 4 words in the line.

#### Given a Shabad ID, retrieve the Lines
```sql 
SELECT * FROM lines WHERE shabad_id = '9N9' ORDER BY order_id
```

#### Given a Source, retrieve all the Translation Sources, with Languages and Author Names
```sql
SELECT * FROM sources
JOIN translation_sources ON translation_sources.source_id = sources.id
JOIN languages ON languages.id = translation_sources.language_id
WHERE source_id = 1
```

### Given any Shabad ID (from any Source), retrieve the possible Translations
```sql
SELECT * FROM lines
JOIN shabads ON shabads.id = lines.shabad_id
JOIN translations ON lines.id = translations.line_id 
WHERE shabad_id = 'W9Z'
ORDER BY lines.order_id
```

### Given any Shabad ID (from any Source), retrieve the English Transliterations
```sql
SELECT * FROM lines
JOIN shabads ON shabads.id = lines.shabad_id
JOIN transliterations ON lines.id = transliterations.line_id 
JOIN languages ON languages.id = transliterations.language_id
WHERE shabad_id = 'W9Z' AND languages.name_english = 'English'
ORDER BY lines.order_id
```

#### Given some Lines, retrieve the Dr. Sant Singh Khalsa English Translations
```sql
SELECT * FROM lines
JOIN translations ON lines.id = translations.line_id
JOIN translation_sources ON translation_sources.id = translations.translation_source_id
WHERE shabad_id = 'W9Z'
AND translation_sources.name_english = 'Dr. Sant Singh Khalsa'
ORDER BY order_id
```

**Note:** it is preferable to select a translation source by its `id`, than a text value, unlike the example above, since text values can change.

#### Fetch all the Lines for a given Bani
```sql
SELECT * FROM lines
JOIN bani_lines ON bani_lines.line_id = lines.id
WHERE bani_lines.bani_id = 1
ORDER BY order_id
```

Fetch a list of Banis and their corresponding `id`s with `SELECT * FROM banis`.

#### Fetch all the Shabads for a given Writer

```sql
SELECT * FROM lines
JOIN shabads ON shabads.id = lines.shabad_id
WHERE writer_id = 3
```

Fetch a list of writers and their `id`s with `SELECT * FROM writers`.

#### Fetch all Sections and Subsections for all Sources

```sql
SELECT * FROM sources
JOIN sections ON sections.source_id = sources.id
JOIN subsections ON subsections.section_id = sections.id
```

## Offline Applications - JavaScript

The offline JavaScript API is perfect for [Node](https://nodejs.org) applications. Once installed using `npm install @shabados/database`, the module can be used to query the database using the fluid interface that [Objection.js](http://vincit.github.io/objection.js/) and [Knex](https://knexjs.org/) provide.

The module exposes an [Objection.js Model](http://vincit.github.io/objection.js/#models) for each table in the database, and can automatically fetch any relations. 

A quick example of querying an [Objection.js Model](http://vincit.github.io/objection.js/#models) can be seen below. Each query must begin with a `.query()` method call, which will return a [Knex Query Builder object](https://knexjs.org/#Builder) that can be used to build up the query by chaining method calls.

This kicks off a jQuery-like chain, with which you can call additional query builder methods as needed to construct the query, eventually calling any of the interface methods, to either convert toString, or execute the query, returning the results as a  promise, callback, or stream.

Let's start by fetching all the Gurbani sources that the database has:

```js
// Import the Sources Model from the module
const { Sources } = require('@shabados/database')

Sources
  .query()                                // Returns a Knex Query Builder
  .then(results => console.log(results))  // Results are returned as a promise
```

ES7 async/await can also be used with the results: `await Sources.query()`.

The [API](api) section describes the usage in more detail, with common examples.

## Online Applications - GurbaniNow API

The [GurbaniNow API](https://github.com/gurbaninow/api) is a fast and powerful JSON API for querying Gurbani content. GurbaniNow and Shabad OS have teamed up to provide the Shabad OS database through GurbaniNow's popular API. 

The [GurbaniNow API](https://github.com/gurbaninow/api) is perfect for online applications and websites that wish to integrate Gurbani, without needing writing their own queries and code around the Shabad OS database.

Visit [their repository](https://github.com/gurbaninow/api) for more information.

!> **Currently, the API does not use the Shabad OS database.** The GurbaniNow and Shabad OS teams are currently working together to seamlessly switch over the data sources that power the GurbaniNow API to the Shabad OS database.