# Contributing to Database

> [!NOTE]
> This document is for developers or programmers contributing to the source code of Database.

There are many ways to contribute, beyond writing code or programming, by: logging bugs, reporting issues, and creating suggestions. To do so, please [create a ticket](https://github.com/shabados/database/issues/new/choose) in our issue tracker. See other ways to [Contribute](README.md#Contributing) or give [Feedback](README.md#Feedback).

## Getting Started

You'll need Git + Bun installed on your machine. We recommend using [mise](https://mise.jdx.dev/) to manage Bun versions. Don't forget to install the dependencies by running `bun install`.

> [!TIP]
> If you're using VS Code + forks, you can install the recommended extensions for a better DX.

## Linting + Formatting

We use Biome for linting + formatting. You can run `bun run lint` to check for linting errors. If you'd like to fix linting errors automatically, you can run `bun run format` to format the code.

> [!TIP]
> Using VS Code, you can use the Biome extension to get linting + formatting suggestions. This is included in the recommended extensions.

## Source Data

Source data is stored in the `collections` as a series of JSON files conforming to schemas. See [Collections](docs/collections.md) for more information.

You can validate the collection data by running `bun run collections:validate`.

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages. This helps us generate changelogs + auto-update the database. We use `commitlint` to enforce this as a git hook.

## Thank you

Your contributions to open source, large or small, make great projects like this possible. Thank you for taking the time to participate in this project.
