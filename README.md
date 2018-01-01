
# Database
An open gurbani database containing an evolving set of corrections. Used in Shabad OS software.

## Schema

[schema](schema.png)

## Development

### Building

Install [docker](http://docker.com).

Run `docker-compose up db` to generate the SQLite3 DB in the `build` folder.

### Contributing

The content for each ang can be found in the corresponding js file in the `seeds` folder. 
Modify this and run the build as detailed above to generate a new SQLite3 DB with the changes.

The schema can be changed in the `migrations/schema.js` file.

## Releases

Compiled databases are available via the release page.
      
## Viewing

Alternately, you can use an application like [DBeaver](https://dbeaver.jkiss.org/) to view the SQLite file.

## Todo

- Provide contribution guidelines
- Redo English translations under an open license
- Secondary priority is to research licenses that disallow monetary gain and incorrect changes while also enforcing a requirement to share the database regardless of how it is being used (examples: cloud-service, desktop/mobile applications, or presentations). This may apply to the Gurbani data in the future.
