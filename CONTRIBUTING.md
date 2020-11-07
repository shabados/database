# Contributing to Database

Thank you for your interest in participating!

There are many ways to contribute, beyond writing code or programming, by: logging bugs, reporting issues, and creating suggestions. To do so, please [create a ticket](https://github.com/shabados/database/issues/new/choose) in our issue tracker. See other ways to [Contribute](README.md#Contributing) or give [Feedback](README.md#Feedback).

This document is for developers or programmers contributing to the source code of Database.

**Table of Contents**

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Build](#build)
  - [Run](#run)
  - [Convert & Import/Export](#convert--importexport)
  - [Docker](#docker)
- [File/Folder Structure](#filefolder-structure)
  - [Schema](#schema)
  - [Data Folder](#data-folder)
- [Workflow](#workflow)
  - [Coding Guidelines](#coding-guidelines)
  - [Scope](#scope)
- [Thank you](#thank-you)

## Getting Started

If you wish to better understand how Database works or want to debug an issue: get the source, build it, and run it locally.

### Prerequisites

In order to download necessary tools, clone the repository, and install dependencies, you'll need network access. To view the database you'll need a database viewer (e.g. [DBeaver](https://dbeaver.io/)).

You'll need the following:

- [Git](https://git-scm.com/)
- [Node.JS](https://nodejs.org) (If you need to manage multiple Node.JS versions, [use a node version manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) to install)

Get the source code of `database` repo:

```shell
gh repo fork shabados/database --clone=true
```

**PROTIP**: Use the [`gh` cli tool from GitHub](https://cli.github.com/) to fork the repo to your GitHub account (if not already), clone it to your local machine, and set the appropriate remotes for origin and upstream with the above command.

### Build

Run `npm i` in the root directory. Build an sqlite file by entering `npm run build-sqlite`.

### Run

Usage:

```shell
npm run <command>
```

The commands are:

```shell
build-sqlite  # Generate an sqlite db in the build folder
build-mysql   # Builds and writes the source data to a running MySQL instance

build-json    # Generate a json file of build/database.sqlite
import        # Import an sqlite db into build/database.sqlite
generate-id   # Generate unique ID for shabad or line

benchmark
release
precommit
serve-docs
```

### Convert & Import/Export

Mass changes can be made to the repo by building an sqlite file, editing it, then building the json from it to commit upstream. Mass changes are usually reserved for cases like renaming the transliteration of a name. These changes will not be accepted from outside collaborators and is reserved for maintainers, admins, or owners of the Shabad OS project.

It's possible to import other sqlite files. Run `npm run import -- --help` to see all options. The importer will generate placeholder Sources, Translation Sources, and fill in -1 for Shabad sections and Writer IDs. These must be corrected in `build/database.sqlite`. Then you will need to follow the note above to commit changes. Importing is reserved for maintainers, admins, or owners of the Shabad OS project.

Example import command:

```shell
npm run import -- nandlal.sqlite nandlal -o ID -s ShabadID -2 ShabadID -S SourceID -t English -t Punjabi -p PageNo -l LineNo -g Gurmukhi
```

### Docker

In addition to the above comamnds, you can run a Shabad OS MariaDB using Docker (username: `shabados`, database name: `shabados`):

```shell
docker run -p 3306:3306 shabados/database
```

If you'd like to build the image yourself, run:

```shell
docker build -f docker/mariadb/Dockerfile -t shabados/database .
```

## File/Folder Structure

### Schema

The schema can be modified in the `migrations/schema.js` file.

JSON files for `Raags`, `Sources`, `Writers`, and `Line_Types` can be found in the `data` folder. Changing a value here will be reflected everywhere else. The `(array index) + 1` represents the id used for each relation in other tables.

Lines of JSON files are split by page or other sensible method via `./data/source/number.json`.

Bani compilations can be added to the `bani.json`. To define the lines it contains, each bani should contain a list of objects with `start_line` and `end_line`, referring to the files in `sources`.

### Data Folder

Binary files are difficult to track in git. Therefore the JSON files in the data folder is used as the source of truth for the Shabad OS Database.

- Source folders - JSON files contain the id, gurmukhi, pronunciation, and translations of each line of parent folder's source
- JSON files - these files range from compiling banis, separating sections and sub-sections, to naming languages, translations, and writers

## Workflow

The workflow of development (or Git Flow) is to [choose/create an issue](https://github.com/shabados/database/issues) to work on, [create a feature branch](https://github.com/shabados/.github/wiki/How-to-Contribute#branches), and [submit a pull request](https://github.com/shabados/.github/wiki/How-to-Contribute#pull-requests).

**PROTIP**: Read more about our workflow (issue tracking, branching, and pull requests) in the [How To Contribute wiki article](https://github.com/shabados/.github/wiki/How-to-Contribute).

### Coding Guidelines

Please see the [wiki](https://github.com/shabados/.github/wiki/How-to-Contribute#coding-guidelines) for Coding Guidelines ([Names](https://github.com/shabados/.github/wiki/How-to-Contribute#41-names), [Comments](https://github.com/shabados/.github/wiki/How-to-Contribute#42-comments), [Style](https://github.com/shabados/.github/wiki/How-to-Contribute#43-style), [Linting](https://github.com/shabados/.github/wiki/How-to-Contribute#44-linting), and [Commit Messages](https://github.com/shabados/.github/wiki/How-to-Contribute#45-commit-messages)).

### Scope

To be used in [commit messages](https://github.com/shabados/.github/wiki/How-to-Contribute#45-commit-messages).

Usage:

```shell
<type>(<scope>): <subject>
```

The scopes are:

```shell
lib
data
```

## Thank you

Your contributions to open source, large or small, make great projects like this possible. Thank you for taking the time to participate in this project.
