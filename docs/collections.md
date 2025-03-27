# Collections

The `collections` directory contains the fundamental source data for the database. It is organized into a series of subdirectories, each representing an entity type.

Ultimately, these collections are used to generate the database.

## Schema

Each collection is a [TOML](https://toml.io/en/) file conforming to the [JSON Schema](https://json-schema.org/) specified in the `$schemas` subdirectory. For example, the `assets` collection schema is defined in [`$schemas/assets.json`](/collections/$schemas/assets.json).

### Why TOML?

TOML is a simple, human-readable format that is easy to understand and write. It is also a strict superset of JSON, meaning that any valid JSON file is also a valid TOML file.

Given the growing complexity of the schema, TOML provided greater readability and maintainability for humans over JSON.

### Visualize Schemas

To visualize the collection schemas, you can run `npm run collections:preview` to launch a local redocly server.

### Validate Collections

To validate the collection data against the schemas, you can run `npm run collections:validate`.

Any failures will be logged to the console. Validation also runs as part of the CI pipeline, to prevent malformed data from landing.

## Definitions

### Sources

Primary compositions that contain the fundamental content.

Example: Sri Guru Granth Sahib is a source containing thousands of lines of Gurbani.

### Lines

Abstract identifiers that represent a unique piece of content. The actual text/translations come from assets, meaning the same line (like a verse of Gurbani) can have different presentations across different assets.

Example: Line "ੴ ਸਤਿ ਨਾਮੁ" has one identity but may have multiple translations and representations from different publishers.

### Line Groups

Ordered collections of lines that form a complete thought or composition i.e. shabad.

Example: A shabad is a line group containing multiple lines in sequence

### Authors

The composers of the content, referenced by line groups to indicate authorship.

Example: Guru Nanak Dev Ji is an author of many shabads across different sources.

### Sections

Organizational units that group related line groups together, in order of the source it belongs to.

Example: "Salok Sehshkritee" or "Vaar 24" are sections containing multiple shabads in sequence.

### Ragas

Musical frameworks associated with sections.

Example: Raag Asa defines how content in the Asa section is meant to be sung.

### Assets

Digital resources that provide the actual content for lines (primary content, or translations from different publishers) or supplementary materials.

Assets have 2 fundamental purposes:

- To be a source of primary content for lines
- To provide a related content for a user to browse

#### Examples of primary content:

- Shabadaarth (`SSA2.toml`) provides the primary content for the Gurū Granth Sāhib (`SGGS.toml`) source.
- Dr. Sant Singh Khalsa's translation (`DSSK.toml`) is an asset providing English translations of lines for the Gurū Granth Sāhib (`SGGS.toml`) source.

#### Examples of related assets:

- Kirtan of line groups / banis
- Katha / Podcasts of lines, line groups, banis
- Notes / compositions (pictures) of line groups, banis
- PDFs, books of line groups
