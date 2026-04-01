import assert from 'node:assert/strict'
import test from 'node:test'

import { buildResultMeta, buildWorkSubtitle, getWorkDescription, getWorkTitle, humanizeLabel } from './format'

test('humanizeLabel cleans slugs and underscores', () => {
  assert.equal(humanizeLabel('guru_granth-sahib'), 'Guru Granth Sahib')
})

test('getWorkTitle prefers latin and gurmukhi title fields before slug fallback', () => {
  assert.equal(
    getWorkTitle({
      id: 'work-1',
      slug: 'guru-granth-sahib',
      title: { Latn: 'Sri Guru Granth Sahib', Guru: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ' },
      translation: null,
      summary: null,
      classification: 'scripture',
      textShape: 'verse',
      featured: false,
    }),
    'Sri Guru Granth Sahib',
  )
})

test('getWorkDescription and buildWorkSubtitle fall back to readable labels', () => {
  assert.equal(
    getWorkDescription({
      id: 'work-2',
      slug: 'varan',
      title: { Guru: 'ਵਾਰਾਂ' },
      translation: null,
      summary: null,
      classification: 'collection',
      textShape: 'prose',
      featured: false,
    }),
    'Collection',
  )

  assert.equal(
    buildWorkSubtitle({
      id: 'work-3',
      slug: 'nitnem',
      title: { Guru: 'ਨਿਤਨੇਮ' },
      translation: null,
      summary: null,
      classification: 'prayer',
      textShape: 'poem',
      featured: false,
    }),
    'Poem',
  )
})

test('buildResultMeta keeps the locator and match details together', () => {
  assert.equal(
    buildResultMeta({
      passageId: 'passage-1',
      workSlug: 'guru-granth-sahib',
      workTitle: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ',
      structureLabel: 'ਜਪੁਜੀ ਸਾਹਿਬ',
      locatorLabel: 'Page 1',
      originalText: 'ਇਕ ਓਅੰਕਾਰ',
      matchedBy: 'latin-initials',
      matchedInitials: 'ios',
      score: 99,
    }),
    'Page 1 • latin-initials • ios',
  )
})
