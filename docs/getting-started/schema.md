# Schema

This section describes the structure and schema of the database, in-depth.

The sheer volume of content within the schema may be overwhelming at first, however is structured to provide as much consistency, accuracy, and flexibility as possible.

## Diagram

The SQL schema can be seen below:

![Schema](../schema.png)

The schema can also be explored on [SQLDBM](https://app.sqldbm.com/MySQL/Share/pNAqT007VSFLHnCdfAc9NkGFrngIE8md_DYjF4jNYw0).

## Tables

Below is a brief summary of all the tables available in the database.

| Name                                        | Description                                                              | Conceptual Example                              | Depends on                                    |
| ------------------------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------- | --------------------------------------------- |
| [Lines](#Lines)                             | Gurbani lines, linked to a `Shabad`.                                     | `source_page: 10, Line_Content`                 | `Shabads`, `Line_Types`                       |
| [Line_Content](#Line_Content)               | Corresponding Gurmukhi related to the `source` of a `line`.              | `SGPC: nmsqM mhMqy ]`, `source2: nmsqM mhMqy ]` | `Sources`, `Lines`                            |
| [Line_Types](#Line_Types)                   | List of possible line classifications.                                   | `rahao`, `tuk`                                  | None                                          |
| [Shabads](#Shabads)                         | Grouping of Gurbani `Lines`, with additional metadata.                   | `Writer, Section, Subsection, Lines`            | `Lines`, `Writers`, `Sections`, `Subsections` |
| [Writers](#Writers)                         | Composers of `Shabads`.                                                  | `Guru Angad Dev Ji`                             | None                                          |
| [Compositions](#Compositions)               | A composition of Gurbani `Shabads`.                                      | `Sri Guru Granth Sahib Ji`                      | None                                          |
| [Sources](#Sources)                         | A source of Gurbani .                                                    | `SGPC`, `Budha Dal Mehron`                      | None                                          |
| [Sections](#Sections)                       | Grouping of `Shabads` within a single composition.                       | `Raag Gujri`, `Siree Raag`                      | `Compositions`                                |
| [Subsections](#Subsections)                 | Sub-groupings within a single section.                                   | `Mahalaa 1`                                     | `Sections`                                    |
| [Languages](#Languages)                     | Available translation languages.                                         | `English`                                       | None                                          |
| [Transliterations](#Transliterations)       | Transliterations for Gurbani `Lines` in a given `Language` and `Source`. | `SGPC: har har har gun gaavo`                   | `Lines`, `Languages`, `Sources`               |
| [Translation_Sources](#Translation_Sources) | Translation source authors and languages for a single Gurbani source.    | `Language: English, Author: Sant Singh Khalsa`  | `Languages`, `Sources`                        |
| [Translations](#Translations)               | Translations for Gurbani `Lines` from a translation source.              | `The Lord is One`                               | `Lines`, `Translation_Sources`                |
| [Banis](#Banis)                             | Named of available Banis.                                                | `Jap Ji Sahib`                                  | None                                          |
| [Bani_Lines](#Bani_Lines)                   | Groupings of `Lines` to `Banis`.                                         | N/A                                             | `Banis`, `Lines`                              |


### Lines
The [Lines](#Lines) table contains all the Gurbani content, across all sources.

Many lines must belong to one [Shabad](#Shabad).

The content is unordered by default, and must be ordered by `order_id`.
The `id` is a four-letter, immutable identifier that will refer to the same line across database versions.

Currently, the `gurmukhi` stores as an ASCII representation of Gurbani. We are hoping to upgrade this to Unicode eventually.

| Column                    | Type    | Description                                                                                               | Constraints                                         |
| ------------------------- | ------- | --------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| id                        | char(4) | A 4 character unique identifier for the line. Permanent and will never change.                            | Primary Key                                         |
| shabad_id                 | char(3) | A 3 character unique identifier of the [Shabad](#Shabads) that the line belongs to.                       | Foreign Key ([Shabads](#Shabads).id) <br/> Not Null |
| source_page               | integer | The physical "page" number within the source that the line appears on.                                    | Not Null                                            |
| source_line               | integer | The physical "line" number within the source that the line appears on.                                    | None                                                |
| pronunciation             | text    | Guidelines around pronouncing the Gurbani line stored in the `gurmukhi` field, correctly.                 | None                                                |
| pronunciation_information | text    | Additional footnotes about the `pronunciation` guidelines.                                                | None                                                |
| first_letters             | text    | The first letters of each word in the `gurmukhi` line, useful for searching the database by first letter. | Not Null                                            |
| vishraam_first_letters             | text    | Same as `first_letters`, but includes heavy vishraams. Useful for prioritising search results. | Not Null                                            |
| type_id                   | integer | The unique identifier of the line type.                                                                   | Foreign Key ([Line_Types](#Line_Types))             |
| order_id                  | integer | The correct order of the line. Order by this field to fetch the lines in the correct order.               | None                                                |

### Sources
The [Sources](#Sources) table provides a list of all the different source of Gurbani that the database contains. E.g. `SGPC`, `Budha Dal Mehron`.

Sometimes, [sources](#Sources) may overlap for the same [Line](#Lines), since it is possible for the same line to vary slightly.

This is useful for selecting which Gurbani source that a [Line](#Lines) will be displayed from.

| Column        | Type    | Description                                                | Constraints |
| ------------- | ------- | ---------------------------------------------------------- | ----------- |
| id            | integer | The unique identifier of the source.                       | Primary Key |
| name_english  | text    | The name of the source, in English.                        | Not Null    |
| name_gurmukhi | text    | The name of the source, in Gurmukhi, ASCII representation. | Not Null    |
|               |
### Line_Content
The [Line_Content](#Line_Content) table contains the corresponding gurmukhi for a [Line](#Lines) for a [Source](#Sources).

This exists to support the differences between Sources of Gurbani for the same lines.

| Column        | Type    | Description                                                                                               | Constraints                                          |
| ------------- | ------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| line_id       | char(4) | The 4 letter unique identifier of the Gurbani line that the transliteration corresponds with.             | Primary Key, <br/> Foreign Key ([Lines](#Lines).id)  |
| source_id     | integer | The unique identifier of the gurbani source for the line.                                                 | Primary, <br/> Foreign Key ([Sources](#Sources)) Key |
| gurmukhi      | text    | The Gurbani line, stored as an ASCII representation of Gurmukhi.                                          | Not Null                                             |
| first_letters | text    | The first letters of each word in the `gurmukhi` line, useful for searching the database by first letter. | Not Null                                             |


### Line_Types
The [Line_Types](#Line_Types) table contains the possible classifications of each [line](#Lines).

This can be useful for filtering out `rahao` lines from searches, or reordering the `manglacharan` if desired.

!> Currently, this table is yet to be populated.

| Column        | Type    | Description                                                   | Constraints |
| ------------- | ------- | ------------------------------------------------------------- | ----------- |
| id            | integer | The unique identifier of the line type.                       | Primary Key |
| name_english  | text    | The name of the line type, in English.                        | Not Null    |
| name_gurmukhi | text    | The name of the line type, in Gurmukhi, ASCII representation. | Not Null    |

### Shabads
The [Shabads](#Shabads) table is used to group the [Lines](#Lines) together, and provide additional metadata about those [Lines](#Lines).

Every Shabad must have a [composition](#Compositions), [writer](#Writer), and [section](#Section).

The content is unordered by default, and must be ordered by `order_id`.
The `id` is a three-letter, immutable identifier that will refer to the same Sahbad across database versions.

| Column         | Type    | Description                                                                                                 | Constraints                                            |
| -------------- | ------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| id             | char(3) | A 3 character unique identifier for the Shabad. Permanent and will never change.                            | Primary Key                                            |
| writer_id      | integer | The unique identifier of the [writer](#Writers) of the Shabad.                                              | Foreign Key ([Writers](#Writers).id), <br/> Not Null   |
| section_id     | integer | The unique identifier of the [section](#Sections) that the Shabad belongs to.                               | Foreign Key ([Sections](#Sections).id), <br/> Not Null |
| subsection_id  | integer | The unique identifier of the subsection that the Shabad belongs to.                                         | Foreign Key ([Subsections](#Subsections).id)           |
| sttm_id        | integer | The unique identifier of the equivalent Shabad within the SikhiToTheMax 2 database.                         | None                                                   |
| composition_id | integer | The Gurbani [composition](#Compositions) that the Shabad belongs to.                                        | Foreign Key ([Sources](#Sources).id), <br/> Not Null   |
| order_id       | integer | The correct order of the Shabad. Order by this field to fetch the shabads in the correct order, if desired. | None                                                   |

### Writers
The [Writers](#Writers) table contains a list of all the authors and composers of the contents in the database.

| Column        | Type    | Description                                                | Constraints |
| ------------- | ------- | ---------------------------------------------------------- | ----------- |
| id            | integer | The unique identifier of the writer.                       | Primary Key |
| name_english  | text    | The name of the writer, in English.                        | Not Null    |
| name_gurmukhi | text    | The name of the writer, in Gurmukhi, ASCII representation. | Not Null    |

### Sections
The [Sections](#Sections) table contains a list of all the different sections, per [composition](#Compositions).

Every section must have a single [composition](#Composition).

| Column         | Type    | Description                                                                             | Constraints                                                    |
| -------------- | ------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| id             | integer | The unique identifier of the section.                                                   | Primary Key                                                    |
| name_english   | text    | The name of the section, in English.                                                    | Not Null                                                       |
| name_gurmukhi  | text    | The name of the section, in Gurmukhi, ASCII representation.                             | Not Null                                                       |
| description    | text    | The description of the section.                                                         | Not Null                                                       |
| start_page     | integer | The physical "page" from the source that this section begins on.                        | Not Null                                                       |
| end_page       | integer | The physical "page" from the source that this section ends on.                          | Not Null                                                       |
| composition_id | integer | The unique identifier of the [composition](#Compositions) that this section belongs to. | Foreign Key ([Compositions](#Compositions).id), <br/> Not Null |

### Subsections
The [Subsections](#Subsections) table contains a list of all the different subsections, per single [section](#Sections). 

Every subsection must belong to a single [section](#Section).

To determine which [source](#Sources) that a subsection is from, retrieve the source of the section that the subsection belongs to, using `section_id`.

| Column        | Type    | Description                                                                    | Constraints                                            |
| ------------- | ------- | ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| id            | integer | The unique identifier of the subsection.                                       | Primary Key                                            |
| section_id    | integer | The unique identifier of the [section](#Sections) that the section belongs to. | Foreign Key ([Sections](#Sections).id), <br/> Not Null |
| name_english  | text    | The name of the susection, in English.                                         | Not Null                                               |
| name_gurmukhi | text    | The name of the subsection, in Gurmukhi, ASCII representation.                 | Not Null                                               |
| start_page    | integer | The physical "page" from the source that this subsection begins on.            | Not Null                                               |
| end_page      | integer | The physical "page" from the source that this subsection ends on.              | Not Null                                               |

### Compositions
The [Compositions](#Compositions) table provides a list of all the different compositions that the database contains. E.g. `Sri Guru Granth Sahib`.

| Column            | Type    | Description                                                                    | Constraints |
| ----------------- | ------- | ------------------------------------------------------------------------------ | ----------- |
| id                | integer | The unique identifier of the source.                                           | Primary Key |
| name_english      | text    | The name of the source, in English.                                            | Not Null    |
| name_gurmukhi     | text    | The name of the source, in Gurmukhi, ASCII representation.                     | Not Null    |
| length            | integer | The number of physical "pages" in the source.                                  | Not Null    |
| page_name_english | text    | The name of physical "pages" in the source, in English.                        | Not Null    |
| page_name_english | text    | The name of physical "pages" in the source, in Gurmukhi, ASCII representation. | Not Null    |

### Languages
The [Languages](#Languages) table provides a list of all the translation languages that the database currently supports.

| Column             | Type    | Description                                                  | Constraints |
| ------------------ | ------- | ------------------------------------------------------------ | ----------- |
| id                 | integer | The unique identifier of the language.                       | Primary Key |
| name_english       | text    | The name of the language, in English.                        | Not Null    |
| name_gurmukhi      | text    | The name of the language, in Gurmukhi, ASCII representation. | Not Null    |
| name_international | text    | The name of the language, as written in the language itself. | Not Null    |

### Transliterations
The [Transliterations](#Transliterations) table contains the corresponding transliteration of a single line in a given [language](#Languages) and [source](#Sources).

Note that the `transliteration` can be nullable.


| Column          | Type    | Description                                                                                   | Constraints                                                 |
| --------------- | ------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| line_id         | char(4) | The 4 letter unique identifier of the Gurbani line that the transliteration corresponds with. | Primary Key, <br/> Foreign Key ([Lines](#Lines).id)         |
| source_id       | integer | The unique identifier of the [Source](#Sources) that the transliteration is of.               | Primary Key, <br/> Foreign Key ([Sources](#Sources).id)     |
| language_id     | integer | The unique identifier of the [Language](#Languages) that the transliteration is in.           | Primary Key, <br/> Foreign Key ([Languages](#Languages).id) |
| transliteration | text    | The transliteration of the Gurbani line.                                                      | None                                                        |
| first_letters             | text    | The first letters of each word in the `transliteration`, useful for searching the database by first letter. | Not Null                                            |
| vishraam_first_letters             | text    | Same as `first_letters`, but includes heavy vishraams. Useful for prioritising search results. | Not Null                                            |

### Translation_Sources
The [Translation_Sources](#Translation_Sources) table contains all the sources of translations that the database contains, used by the [Translations](#Translations).

A translation source is a combination of the Gurbani [source](#Sources), the [language](#Languages), and the author details.

To retrieve the actual [Translations](#Translations) for a translation source, use the [Translations](#Translations) table.

| Column         | Type    | Description                                                                                                   | Constraints                                                    |
| -------------- | ------- | ------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| id             | integer | The unique identifier of the translation source.                                                              | Primary Key                                                    |
| name_english   | text    | The name of the translation source, in English.                                                               | Not Null                                                       |
| name_gurmukhi  | text    | The name of the translation source, in Gurmukhi, ASCII representation.                                        | Not Null                                                       |
| composition_id | integer | The unique identifier of the Gurbani [composition](#Compositions) that the translation source corresponds to. | Foreign Key ([Compositions](#Compositions).id), <br/> Not Null |
| language_id    | integer | The unique identifier of the [language](#Languages) that the translation source is translated into.           | Foreign Key ([Languages](#Languages).id), <br/> Not Null       |

### Translations
The [Translations](#Translations) table contains the corresponding translation of a single line from a [translation source](#Translation_Sources).

Note that the `translation` can be nullable.

If used, the `additional_information` is a serialised JSON string that must be deserialised with a `JSON.parse()` or equivalent, to support non-standard fields universally across different translation sources.

| Column                 | Type      | Description                                                                                                   | Constraints                                                                     |
| ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| line_id                | char(4)   | The 4 letter unique identifier of the Gurbani line that the translation corresponds with.                     | Primary Key, <br/> Foreign Key ([Lines](#Lines).id)                             |
| translation_source_id  | integer   | The unique identifier of the [translation source](#Translation_Sources) that the translation originates from. | Primary Key, <br/> Foreign Key ([Translation_Sources](#Translation_Sources).id) |
| translation            | text      | The translation of the Gurbani line.                                                                          | None                                                                            |
| additional_information | text/json | Any additional, non-standard data about the translation. Stored as a serialised JSON object.                  | None                                                                            |

### Banis
A Bani is a collection of [Lines](#Lines). The [Banis](#Banis) table provides a list of all the Banis tht the database contains.

To retrieve the actual [Lines](#Lines) within a Bani, use the [Bani_Lines](#Bani_Lines) table. 

| Column        | Type    | Description                                              | Constraints |
| ------------- | ------- | -------------------------------------------------------- | ----------- |
| id            | integer | The unique identifier of the Bani.                       | Primary Key |
| name_english  | text    | The name of the Bani, in English.                        | Not Null    |
| name_gurmukhi | text    | The name of the Bani, in Gurmukhi, ASCII representation. | Not Null    |

### Bani_Lines
The [Bani_Lines](#Bani_Lines) table connects one [Bani](#Banis) to many [Lines](#Lines).

!> The `line_group` field is slightly more complicated, as it orders collections of [lines](#Lines), but not the [lines](#Lines) themselves.

| Column     | Type    | Description                                                                                                                                                                                                         | Constraints                                         |
| ---------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| line_id    | char(4) | The 4 letter unique identifier of a [Line](#Lines).                                                                                                                                                                 | Primary Key, <br/> Foreign Key ([Lines](#Lines).id) |
| bani_id    | integer | The unique identifier of the [Bani](#Banis) that contains this line.                                                                                                                                                | Primary Key, <br/> Foreign Key ([Banis](#Banis).id) |
| line_group | integer | A partition within the [Bani](#Banis) to group [Lines](#Lines). Order by this field, (and the [Lines](#Lines).order_id, if joining) to get the correct order of the groups (and [Lines](#Lines) within the groups). | Primary Key                                         |
