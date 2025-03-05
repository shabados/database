import { type InferOutput, array, number, object, optional, string } from 'valibot'

export const Iso15924Schema = object({
  Latn: string(),
  Guru: string(),
})

export type Iso15924 = InferOutput<typeof Iso15924Schema>

export const Iso639Schema = object({
  en: string(),
  es: string(),
  pa: string(),
})

export type Iso639 = InferOutput<typeof Iso639Schema>

export const PersonSchema = object({
  first: string(),
  middle: optional(string()),
  last: string(),
  prefix: optional(string()),
  suffix: optional(string()),
})

export const PublisherSchema = object({
  name: string(),
  city: optional(string()),
  country: optional(string()),
})

export const PublicationSchema = object({
  date: string(),
  version: optional(string()),
})

export const VolumeSchema = object({
  current: optional(number()),
  total: optional(number()),
})

export const SourceSchema = object({
  authors: array(PersonSchema),
  translators: optional(array(PersonSchema)),
  title: string(),
  subtitle: optional(string()),
  edition: optional(string()),
  publisher: PublisherSchema,
  publication: PublicationSchema,
  url: optional(string()),
  accessed: optional(string()),
  volume: optional(VolumeSchema),
  type: optional(string()),
  language: optional(string()),
  isbn: optional(string()),
  doi: optional(string()),
  pages: optional(string()),
  notes: optional(string()),
})

export const AssetSchema = object({
  name: Iso15924Schema,
  source: SourceSchema,
})

export type Asset = InferOutput<typeof AssetSchema>
