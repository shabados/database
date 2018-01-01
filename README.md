
# Database
An open gurbani database containing an evolving set of corrections. Used in Shabad OS software.

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

The `seeds` folder is structured by source, and then a folder with the number of the ang.
Each folder contains all the ang files

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

Compiled databases are available via the release page.
      
## Viewing

You can use an application like [DBeaver](https://dbeaver.jkiss.org/) to view the SQLite file.

## Todo

- Redo English translations under an open license
