import assert from 'node:assert/strict'
import test from 'node:test'

import { buildSearchDocumentFields, normalizeLatinInitialQuery } from '@giaan-khand/search-core'

import { buildPangtiDocument, buildTypesenseQuery } from '../src/services/pangti-document'
import { pangtiFixtures, pangtiQueryFixtures } from './fixtures/pangti'

const pangtiRow = {
  passage: pangtiFixtures.passages[0],
  text: pangtiFixtures.passageTexts[0],
  structureNode: pangtiFixtures.structureNodes[0],
  work: pangtiFixtures.works[0],
}

test('buildPangtiDocument indexes the pangti with matching initials and locators', () => {
  const document = buildPangtiDocument(pangtiRow as never)
  const searchFields = buildSearchDocumentFields(pangtiFixtures.passageTexts[0].body)

  assert.deepEqual(
    {
      id: document.id,
      passageId: document.passageId,
      workSlug: document.workSlug,
      workTitle: document.workTitle,
      structureSlug: document.structureSlug,
      structureLabel: document.structureLabel,
      locatorLabel: document.locatorLabel,
      originalText: document.originalText,
      normalizedText: document.normalizedText,
      gurmukhiInitials: document.gurmukhiInitials,
      latinInitials: document.latinInitials,
      pageStart: document.pageStart,
      pageEnd: document.pageEnd,
      workPosition: document.workPosition,
    },
    {
      id: 'text-1',
      passageId: 'passage-1',
      workSlug: 'guru-granth-sahib',
      workTitle: 'ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ',
      structureSlug: 'japji-sahib',
      structureLabel: 'ਜਪੁਜੀ ਸਾਹਿਬ',
      locatorLabel: 'Pages 1-2',
      originalText: pangtiFixtures.passageTexts[0].body,
      normalizedText: searchFields.normalizedText,
      gurmukhiInitials: searchFields.gurmukhiInitials,
      latinInitials: searchFields.latinInitials,
      pageStart: 1,
      pageEnd: 2,
      workPosition: 1,
    },
  )
})

test('buildTypesenseQuery routes direct Gurmukhi and Latin initials to the same pangti intent', () => {
  const directQuery = buildTypesenseQuery(pangtiQueryFixtures.directQuery)
  const latinQuery = buildTypesenseQuery(pangtiQueryFixtures.latinQuery)
  const aliasQuery = buildTypesenseQuery(pangtiQueryFixtures.aliasQuery)

  assert.deepEqual(directQuery, {
    mode: 'gurmukhi',
    normalizedQuery: buildSearchDocumentFields(pangtiQueryFixtures.directQuery).normalizedText,
    queryBy: 'normalizedText',
    prefix: false,
  })

  assert.deepEqual(latinQuery, {
    mode: 'latin-initials',
    normalizedQuery: normalizeLatinInitialQuery(pangtiQueryFixtures.latinQuery),
    queryBy: 'latinInitials',
    prefix: true,
  })

  assert.deepEqual(aliasQuery, {
    mode: 'latin-initials',
    normalizedQuery: 'dkg',
    queryBy: 'latinInitials',
    prefix: true,
  })

  assert.equal(
    buildPangtiDocument(pangtiRow as never).latinInitials,
    latinQuery.normalizedQuery,
  )
})
