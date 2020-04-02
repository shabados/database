# Overview

This section outlines methods of using of the database, and goes through some examples.

There are several methods of using the database, depending on your purpose:
- [Overview](#overview)
  - [General Browsing/Querying](#general-browsingquerying)
  - [Offline Applications - SQLite](#offline-applications---sqlite)
  - [Offline Applications - JavaScript](#offline-applications---javascript)
  - [Online Applications - GurbaniNow API](#online-applications---gurbaninow-api)

## General Browsing/Querying
If you're interested in the contents of the database, start by downloading the latest
[SQLite database release](https://github.com/ShabadOS/database/releases), and an SQLite browser such as [DBeaver](https://dbeaver.io/).

Once installed, open the `Database > New Connection` dialog. Select the `SQLite` type from the list, and press `Next`. On the following screen, press the `Browse` button and select the Shabad OS database file that you previously downloaded, and proceed through the next screens until wizard is complete.

A new database entry will appear under the `Database Navigator` tab, and double-clicking this will open the database. Expand the `tables` option to view all the tables in the database, and double-click on any of the tables to view the data. You may also run some of the [SQL queries](#Offline-Applications-SQLite) and explore the dataset further.

Some common query examples can be seen at [SQLite Querying](usage/queries).

## Offline Applications - SQLite
If you're building a mobile app or desktop application, you'll likely want an offline copy of the database, unless you're certain your users will always be connected to the internet.

You can download the latest [SQLite database release](https://github.com/ShabadOS/database/releases) and query against it using your language's SQLite library.

!> This option will mean that you will have to check the Shabad OS Database release page for updates yourself. If you are building an application in JavaScript, please see the [Offline Applications - JavaScript](#Offline-Applications-JavaScript) section below.

Some common query examples can be seen at [SQLite Querying](usage/queries).

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

The [module](usage/module) section describes the usage in more detail, with common examples.

## Online Applications - GurbaniNow API

The [GurbaniNow API](https://github.com/gurbaninow/api) is a fast and powerful JSON API for querying Gurbani content. GurbaniNow and Shabad OS have teamed up to provide the Shabad OS database through GurbaniNow's popular API. 

The [GurbaniNow API](https://github.com/gurbaninow/api) is perfect for online applications and websites that wish to integrate Gurbani, without needing writing their own queries and code around the Shabad OS database.

Visit [their repository](https://github.com/gurbaninow/api) for more information.
