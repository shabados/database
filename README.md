# Database
The open gurbani database containing an evolving set of corrections. Used in Shabad OS software.

## Installation

* Download the SQLite db "data" from the release page
* Move it to our [Golang App](https://github.com/ShabadOS/shabadOS)'s includes folder:

      cp data $GOPATH/src/shabadOS/includes/data
      
## Viewing

Alternately, you can use an application like [DBeaver](https://dbeaver.jkiss.org/) to view the SQLite file.

## Future

Main priorities are to (1) shift to a method that allows tracking changes to the database and (2) re-do english translations under an open license.

Secondary priority is to research licenses that disallow monetary gain and incorrect changes while also enforcing a requirement to share the database regardless of how it is being used (examples: cloud-service, desktop/mobile applications, or presentations). This may apply to the Gurbani data in the future.
