const GURMUKHI_REGEX = /\p{Script=Gurmukhi}/u
const TOKEN_REGEX = /[\p{Letter}\p{Number}\p{Mark}]+/gu

const LATIN_ALIAS_MAP: Record<string, string> = {
  c: 'c',
  f: 'p',
  q: 'k',
  v: 'v',
  w: 'v',
  x: 'k',
  z: 'j',
}

const GURMUKHI_TO_LATIN: Record<string, string> = {
  'ਅ': 'a',
  'ਆ': 'a',
  'ਇ': 'i',
  'ਈ': 'i',
  'ਉ': 'u',
  'ਊ': 'u',
  'ਏ': 'e',
  'ਐ': 'e',
  'ਓ': 'o',
  'ਔ': 'o',
  'ੳ': 'a',
  'ਅ਼': 'a',
  'ਸ': 's',
  'ਸ਼': 's',
  '਷': 's',
  'ਹ': 'h',
  'ਕ': 'k',
  'ਖ': 'k',
  'ਖ਼': 'k',
  'ਗ': 'g',
  'ਘ': 'g',
  'ਙ': 'n',
  'ਚ': 'c',
  'ਛ': 'c',
  'ਜ': 'j',
  'ਝ': 'j',
  'ਜ਼': 'j',
  'ਞ': 'n',
  'ਟ': 't',
  'ਠ': 't',
  'ਡ': 'd',
  'ਢ': 'd',
  'ਣ': 'n',
  'ਤ': 't',
  'ਥ': 't',
  'ਦ': 'd',
  'ਧ': 'd',
  'ਨ': 'n',
  'ਪ': 'p',
  'ਫ': 'p',
  'ਫ਼': 'p',
  'ਬ': 'b',
  'ਭ': 'b',
  'ਮ': 'm',
  'ਯ': 'y',
  'ਰ': 'r',
  'ੜ': 'r',
  'ਲ': 'l',
  'ਲ਼': 'l',
  'ਵ': 'v',
}

export type QueryMode = 'gurmukhi' | 'latin-initials'

export const tokenizeGurmukhiText = (value: string) => value.match(TOKEN_REGEX) ?? []

export const normalizeGurmukhiText = (value: string) =>
  tokenizeGurmukhiText(value.trim().normalize('NFC')).join(' ')

export const extractGurmukhiInitials = (value: string) =>
  tokenizeGurmukhiText(value)
    .map((token) => Array.from(token)[0] ?? '')
    .filter(Boolean)
    .join('')

const canonicalizeLatinCharacter = (character: string) =>
  LATIN_ALIAS_MAP[character.toLowerCase()] ?? character.toLowerCase()

export const normalizeLatinInitialQuery = (value: string) =>
  Array.from(value.toLowerCase())
    .filter((character) => /[a-z0-9]/.test(character))
    .map(canonicalizeLatinCharacter)
    .join('')

export const toLatinInitials = (value: string) =>
  Array.from(extractGurmukhiInitials(value))
    .map((character) => GURMUKHI_TO_LATIN[character] ?? '')
    .join('')

export const detectQueryMode = (value: string): QueryMode =>
  GURMUKHI_REGEX.test(value) ? 'gurmukhi' : 'latin-initials'

export const buildSearchDocumentFields = (value: string) => ({
  normalizedText: normalizeGurmukhiText(value),
  gurmukhiInitials: extractGurmukhiInitials(value),
  latinInitials: toLatinInitials(value),
})
