/* eslint-disable max-classes-per-file, import/no-extraneous-dependencies */

declare module '@shabados/database' {
  import { Model, QueryBuilder } from 'objection'

  export const knex: ReturnType<Model['$knex']>

   type CommonBuilder<M extends Model> = QueryBuilder<M> & {
     withTranslations: ( fn?: ( query: CommonBuilder<M> ) => CommonBuilder<M> ) => CommonBuilder<M>,
     withTransliterations: (
       fn?: ( query: CommonBuilder<M> ) => CommonBuilder<M>
     ) => CommonBuilder<M>,
   }

   type LinesBuilder = QueryBuilder<Lines> & {
     withTranslations: ( fn?: ( query: LinesBuilder ) => LinesBuilder ) => LinesBuilder,
     withTransliterations: ( fn?: ( query: LinesBuilder ) => LinesBuilder ) => LinesBuilder,
     firstLetters: ( query: string ) => LinesBuilder,
     fullWord: ( query: string ) => LinesBuilder,
   }

   export class Translations extends Model {
     lineId: string
     translationSourceId: number
     translation: string
     additionalInformation: string

     translationSource?: TranslationSources
     line?: Lines
   }

   export class Transliterations extends Model {
     lineId: string
     languageId: number
     transliteration: string

     language?: Lnaguages
     line?: Lines
   }

   export class Lines extends Model {
     QueryBuilderType: LinesBuilder

     id: string
     shabadId: string
     sourcePage: number
     sourceLine: number
     firstLetters: string
     vishraamFirstLetters: string
     gurmukhi: string
     pronunciation: string
     pronunctiationInformation: string
     typeId: number
     orderId: number

     shabad?: Shabads
     translations?: Translations[]
     transliterations?: Transliterations[]
   }

   export class Shabads extends Model {
     QueryBuilderType: CommonBuilder<this>

     id: string
     sourceId: number
     writerId: number
     sectionId: number
     subsectionId: number
     sttmId: number
     orderId: number

     writer?: Writers
     section?: Sections
     subsection?: Subsections
     source?: Sources
     lines?: Lines[]
   }

   export class Languages extends Model {
     QueryBuilderType: CommonBuilder<this>

     id: number
     nameGurmukhi: string
     nameEnglish: string
     nameInternational: string

     translationSources?: TranslationSources[]
   }

   export class TranslationSources extends Model {
     id: number
     nameGurmukhi: string
     nameEnglish: string
     sourceId: number
     languageId: number

     source?: Sources
     language?: Languages
     translations?: Translations[]
   }

   export class Writers extends Model {
     nameGurmukhi: string
     nameEnglish: string

     shabads?: Shabads[]
   }

   export class Subsections extends Model {
     id: number
     sectionId: number
     nameGurmukhi: string
     nameEnglish: string
     startPage: number
     endPage: number

     shabads?: Shabads[]
     section?: Sections
   }

   export class Sections extends Model {
     id: number
     sourceId: number
     nameGurmukhi: string
     nameEnglish: string
     description: string
     startPage: number
     endPage: number

     shabads?: Shabads[]
     source?: Sources
     subsections?: Subsections[]
   }

   export class Sources extends Model {
     id: number
     nameGurmukhi: string
     nameEnglish: string

     shabads?: Shabads[]
     translationSources?: TranslationSources[]
     sections?: Sections[]
   }

   export class Banis extends Model {
     QueryBuilderType: CommonBuilder<this>

     nameGurmukhi: string
     nameEnglish: string

     lines?: (Lines & { lineGroup: number })[]
   }
}
