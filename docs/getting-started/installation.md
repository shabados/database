## SQLite
The SQLite3 database can be downloaded from [GitHub Releases](https://github.com/ShabadOS/database/releases), and follows the [schema](#schema) described further on.

*> Do **NOT** modify any existing content of the database under any circumstances. If there is a mistake, please file an issue.
The only exception to this rule is that tables that are not required may be dropped to save storage space in constrained environments.

Running `SELECT * FROM Lines ORDER BY order_id LIMIT 100` will return the first 100 lines that the database contains, in the correct order.

Examples of useful and common queries can be found in the [examples](examples) section.


## npm
The database is packaged as an npm module,

## Variants

## GurbaniNow API