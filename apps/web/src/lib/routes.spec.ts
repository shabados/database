import assert from 'node:assert/strict'
import test from 'node:test'

import { buildSearchHref, buildWorkHref } from './routes'

test('buildSearchHref omits empty queries', () => {
  assert.equal(buildSearchHref('   '), '/')
  assert.equal(buildSearchHref('ਇਕ'), '/search?q=%E0%A8%87%E0%A8%95')
  assert.equal(buildSearchHref('  ਇਕ ਓਅੰਕਾਰ  '), '/search?q=%E0%A8%87%E0%A8%95%20%E0%A8%93%E0%A8%85%E0%A9%B0%E0%A8%95%E0%A8%BE%E0%A8%B0')
})

test('buildWorkHref preserves query context when provided', () => {
  assert.equal(buildWorkHref('guru-granth-sahib'), '/works/guru-granth-sahib')
  assert.equal(buildWorkHref('guru/granth sahib', '   '), '/works/guru%2Fgranth%20sahib')
  assert.equal(
    buildWorkHref('guru-granth-sahib', 'ਇਕ ਓਅੰਕਾਰ'),
    '/works/guru-granth-sahib?q=%E0%A8%87%E0%A8%95%20%E0%A8%93%E0%A8%85%E0%A9%B0%E0%A8%95%E0%A8%BE%E0%A8%B0',
  )
})
