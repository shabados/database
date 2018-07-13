# Schema

This section describes the structure and schema of the database, in-depth.

The sheer volume of content within the schema may be overwhelming at first, however is structured to provide as much consistency, accuracy, and flexibility as possible.

## Diagram

The SQL schema can be seen below:

![Schema](../schema.png)

## Tables

Below is a brief summary of all the tables available in the database.

| Name | Description | Depends on |
| ---- | ----------- | ---------- |
| [Lines](#Lines) | Gurbani lines, linked to a `Shabad`. | `Shabads`, `Line_Types` |
| [Line_Types](#Line_Types) | List of possible line classifications. E.g. `rahao`, `tuk`. | None |
| [Shabads](#Shabads) | Grouping of Gurbani `Lines`, with additional metadata. | `Lines`, `Writers`, `Sections`, `Subsections` |
| [Writers](#Writers) | Composers of `Shabads`. | None |
| [Sources](#Sources) | A source of Gurbani `Shabads` or `Lines`. | None |
| [Sections](#Sections) | Grouping of `Shabads` within a single source. | `Sources` |
| [Subsections](#Subsections) | Sub-groupings within a single section. | `Sections` |
| [Languages](#Languages) | Available translation languages. | None |
| [Translation_Sources](#Translation_Sources) | Translation source authors and languages for a single Gurbani source. | `Languages`, `Sources` |
| [Translations](#Translations) | Translations for Gurbani `Lines` from a translation source. | `Lines`, `Translation_Sources` |
| [Banis](#Banis) | Named of available Banis. | None |
| [Bani_Lines](#Bani_Lines) | Groupings of `Lines` to `Banis`. | `Banis`, `Lines` |


### Lines
> The [Lines](#Lines) table contains all the Gurbani content, across all sources.

Many lines must belong to one [Shabad](#Shabad).

The content is unordered by default, and must be ordered by `order_id`.
The `id` is a four-letter, immutable identifier that will refer to the same line across database versions.

Currently, the `gurmukhi` stores as an ASCII representation of Gurbani. We are hoping to upgrade this to Unicode eventually.

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| id | char(4) | A 4 character unique identifier for the line. Permanent and will never change. | Primary Key | 
| shabad_id | char(3) | A 3 character unique identifier of the [Shabad](#Shabads) that the line belongs to. | Foreign Key ([Shabads](#Shabads).id) <br/> Not Null
| source_page | integer | The physical "page" number within the source that the line appears on. | Not Null |
| source_line | integer | The physical "line" number within the source that the line appears on. | None |
| gurmukhi | text | The Gurbani line, stored as an ASCII representation of Gurmukhi. | Not Null |
| pronunciation | text | Guidelines around pronouncing the Gurbani line, `gurmukhi`, correctly. | None |
| pronunciation_information | text | Additional footnotes about the `pronunciation` guidelines. | None |
| transliteration_english | text | The transliterated `gurmukhi` into English, allowing English readers to pronounce the `gurmukhi`. | Not Null |
| transliteration_hindi | text | The transliterated `gurmukhi` into Hindi, allowing Hindi readers to pronounce the `gurmukhi`. | Not Null |
| first_letters | text | The first letters of each word in the `gurmukhi` line, useful for searching the database by first letter. | Not Null |  
| type_id | integer | The unique identifier of the line type. | Foreign Key ([Line_Types](#Line_Types)) |
| order_id | integer | The correct order of the line. Order by this field. | None |

### Line_Types
> The [Line_Types](#Line_Types) table contains the possible classifications of each [line](#Lines).

This can be useful for filtering out `rahao` lines from searches, or reordering the `manglacharan` if desired.

!> Currently, this table is yet to be populated.

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| id | integer | The unique identifier of the line type. | Primary Key |
| name_english | text | The name of the line type, in English. | Not Null |
| name_gurmukhi | text | The name of the line type, in Gurmukhi, ASCII representation. | Not Null |

### Shabads
> The [Shabads](#Shabads) table is used to group the [Lines](#Lines) together, and provide additional metadata about those [Lines](#Lines).

Every Shabad must have a [source](#Sources), [writer](#Writer), and [section](#Section).

The content is unordered by default, and must be ordered by `order_id`.
The `id` is a three-letter, immutable identifier that will refer to the same Sahbad across database versions.

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| id | char(3) | A 3 character unique identifier for the Shabad. Permanent and will never change. | Primary Key |
| writer_id | integer | The unique identifier of the [writer](#Writers) of the Shabad. | Foreign Key ([Writers](#Writers).id), <br/> Not Null |
| section_id | integer | The unique identifier of the [section](#Sections) that the Shabad belongs to. | Foreign Key ([Sections](#Sections).id), <br/> Not Null |
| subsection_id | integer | The unique identifier of the subsection that the Shabad belongs to. | Foreign Key ([Subsections](#Subsections).id) |
| sttm2_id | integer | The unique identifier of the equivalent Shabad within the SikhiToTheMax 2 database. | None |
| source_id | integer | The Gurbani [source](#Sources) that the Shabad belongs to. | Foreign Key ([Sources](#Sources).id), <br/> Not Null |
| order_id | integer | The correct order of the Shabad. Order by this field. | None |

### Writers
> The [Writers](#Writers) table contains a list of all the authors and composers of the contents in the database.

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| id | integer | The unique identifier of the writer. | Primary Key |
| name_english | text | The name of the writer, in English. | Not Null |
| name_gurmukhi | text | The name of the writer, in Gurmukhi, ASCII representation. | Not Null |

### Sections
> The [Sections](#Sections) table contains a list of all the different sections, per [source](#Sources).

Every section must have a single [source](#Sources).

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| id | integer | The unique identifier of the section. | Primary Key |
| name_english | text | The name of the section, in English. | Not Null |
| name_gurmukhi | text | The name of the section, in Gurmukhi, ASCII representation. | Not Null |
| description | text | The description of the section. | Not Null |
| start_page | integer | The physical "page" from the source that this section begins on. | Not Null |
| end_page | integer | The physical "page" from the source that this section ends on. | Not Null |
| source_id | integer | The unique identifier of the [source](#Sources) that this section belongs to. | Foreign Key ([Sources](#Sources).id), <br/> Not Null |

### Subsections
> The [Subsections](#Subsections) table contains a list of all the different subsections, per single [section](#Sections). 

Every subsection must belong to a single [section](#Section).

To determine which [source](#Sources) that a subsection is from, retrieve the source of the section that the subsection belongs to, using `section_id`.

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| id | integer | The unique identifier of the subsection. | Primary Key |
| section_id | integer | The unique identifier of the [section](#Sections) that the section belongs to. | Foreign Key ([Sections](#Sections).id), <br/> Not Null |
| name_english | text | The name of the susection, in English. | Not Null |
| name_gurmukhi | text | The name of the subsection, in Gurmukhi, ASCII representation. | Not Null |
| start_page | integer | The physical "page" from the source that this subsection begins on. | Not Null |
| end_page | integer | The physical "page" from the source that this subsection ends on. | Not Null |

### Sources
> The [Sources](#Sources) table provides a list of all the different Gurbani sources that the database contains.

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| id | integer | The unique identifier of the source. | Primary Key |
| name_english | text | The name of the source, in English. | Not Null |
| name_gurmukhi | text | The name of the source, in Gurmukhi, ASCII representation. | Not Null |
| length | integer | The number of physical "pages" in the source. | Not Null |
| page_name_english | The name of physical "pages" in the source, in English. | Not Null |
| page_name_english | The name of physical "pages" in the source, in Gurmukhi, ASCII representation. | Not Null |

### Languages
> The [Languages](#Languages) table provides a list of all the translation languages that the database currently supports.

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| id | integer | The unique identifier of the language. | Primary Key |
| name_english | text | The name of the language, in English. | Not Null |
| name_gurmukhi | text | The name of the language, in Gurmukhi, ASCII representation. | Not Null |
| name_international | text | The name of the language, as written in the language itself. | Not Null |

### Translation_Sources
> The [Translation_Sources](#Translation_Sources) table contains all the sources of translations that the database contains, used by the [Translations](#Translations).

A translation source is a combination of the Gurbani [source](#Sources), the [language](#Languages), and the author details.

To retrieve the actual [Translations](#Translations) for a translation source, use the [Translations](#Translations) table.

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| id | integer | The unique identifier of the translation source. | Primary Key |
| name_english | text | The name of the translation source, in English. | Not Null |
| name_gurmukhi | text | The name of the translation source, in Gurmukhi, ASCII representation. | Not Null |
| source_id | The unique identifier of the Gurbani [source](#Sources) that the translation source corresponds to. | Foreign Key ([Sources](#Sources).id), <br/> Not Null |
| language_id | The unique identifier of the [language](#Languages) that the translation source is translated into. | Foreign Key ([Languages](#Languages).id), <br/> Not Null |

### Translations
> The [Translations](#Translations) table contains the correspoding translation of a single line from a [translation source](#Translation_Sources).

Note that the `translation` can be nullable.

If used, the `additional_information` is a serialised JSON string that must be deserialised with a `JSON.parse()` or equivalent, to support non-standard fields universally across different translation sources.

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| line_id | char(4) | The 4 letter unique identifier of the Gurbani line that the translation corresponds with. | Primary Key, <br/> Foreign Key ([Lines](#Lines).id) |
| translation_source_id | integer | The unique identifier of the [translation source](#Translation_Sources) that the translation originates from. | Primary Key, <br/> Foreign Key ([Translation_Sources](#Translation_Sources).id) |
| translation | text | The translation of the Gurbani line. | None |
| additional_information | text/json | Any additional, non-standard data about the translation. Stored as a serialised JSON object. | None |

### Banis
> A Bani is a collection of [Lines](#Lines). The [Banis](#Banis) table provides a list of all the Banis tht the database contains.

To retrieve the actual [Lines](#Lines) within a Bani, use the [Bani_Lines](#Bani_Lines) table. 

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| id | integer | The unique identifier of the Bani. | Primary Key |
| name_english | text | The name of the Bani, in English. | Not Null |
| name_gurmukhi | text | The name of the Bani, in Gurmukhi, ASCII representation. | Not Null |

### Bani_Lines
> The [Bani_Lines](#Bani_Lines) table connects one [Bani](#Banis) to many [Lines](#Lines).

!> The `line_group` field is slightly more complicated, as it orders collections of [lines](#Lines), but not the [lines](#Lines) themselves.

| Column | Type | Description | Constraints |
| ------ | ---- | ----------- | ----------- |
| line_id | char(4) | The 4 letter unique identifier of a [Line](#Lines). | Primary Key, <br/> Foreign Key ([Lines](#Lines).id) |
| bani_id | integer | The unique identifier of the [Bani](#Banis) that contains this line. | Primary Key, <br/> Foreign Key ([Banis](#Banis).id) |
| line_group | integer | A partition within the [Bani](#Banis) to group [Lines](#Lines). Order by this field, (and the [Lines](#Lines).order_id, if joining) to get the correct order of the groups (and [Lines](#Lines) within the groups). | Primary Key | 
