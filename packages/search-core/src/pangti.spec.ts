import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildSearchDocumentFields,
  detectQueryMode,
  extractGurmukhiInitials,
  normalizeGurmukhiText,
  normalizeLatinInitialQuery,
  toLatinInitials,
} from './pangti'

test('normalizeGurmukhiText strips punctuation and collapses spacing', () => {
  assert.equal(normalizeGurmukhiText(' ਇਕ   ਓਅੰਕਾਰ; ਸਤਿਨਾਮੁ ॥ '), 'ਇਕ ਓਅੰਕਾਰ ਸਤਿਨਾਮੁ')
})

test('extractGurmukhiInitials returns one initial per token', () => {
  assert.equal(extractGurmukhiInitials('ਇਕ ਓਅੰਕਾਰ ਸਤਿਨਾਮੁ'), 'ਇਓਸ')
})

test('toLatinInitials maps gurmukhi initials into canonical latin keys', () => {
  assert.equal(toLatinInitials('ਦਇਆ ਕਰਹੁ ਗੋਬਿੰਦ'), 'dkg')
})

test('normalizeLatinInitialQuery canonicalizes alias keys', () => {
  assert.equal(normalizeLatinInitialQuery('D f w'), 'dpv')
})

test('detectQueryMode prefers gurmukhi when gurmukhi codepoints are present', () => {
  assert.equal(detectQueryMode('ਦਇਆ'), 'gurmukhi')
  assert.equal(detectQueryMode('dkg'), 'latin-initials')
})

test('buildSearchDocumentFields keeps gurmukhi and latin initials aligned', () => {
  assert.deepEqual(buildSearchDocumentFields('ਦਇਆ ਕਰਹੁ ਗੋਬਿੰਦ'), {
    normalizedText: 'ਦਇਆ ਕਰਹੁ ਗੋਬਿੰਦ',
    gurmukhiInitials: 'ਦਕਗ',
    latinInitials: 'dkg',
  })
})

