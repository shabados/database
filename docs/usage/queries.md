# Common SQL Query Examples

This section provides examples of common queries that you may wish to run to retrieve data.

The queries below correspond to the latest version of the [SQLite Database](https://github.com/shabados/database/releases/latest).

These can be implemented in the programming language of choice, or alternatively executed using a database viewer such as [DBeaver](https://dbeaver.io/).

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