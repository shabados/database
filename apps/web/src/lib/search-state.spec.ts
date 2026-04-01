import assert from 'node:assert/strict'
import test from 'node:test'

import { getSearchViewState } from './search-state'

test('getSearchViewState returns browse state before a query is entered', () => {
  assert.deepEqual(
    getSearchViewState({
      query: '   ',
      isLoading: false,
      isPending: false,
      error: null,
      resultCount: 0,
    }),
    {
      kind: 'browse',
      hasQuery: false,
    },
  )
})

test('getSearchViewState prioritizes loading and error states before empty results', () => {
  assert.deepEqual(
    getSearchViewState({
      query: 'ਇਕ',
      isLoading: true,
      isPending: false,
      error: 'timeout',
      resultCount: 0,
    }),
    {
      kind: 'loading',
      hasQuery: true,
    },
  )

  assert.deepEqual(
    getSearchViewState({
      query: 'ਇਕ',
      isLoading: false,
      isPending: false,
      error: 'timeout',
      resultCount: 0,
    }),
    {
      kind: 'error',
      hasQuery: true,
      errorMessage: 'timeout',
    },
  )
})

test('getSearchViewState distinguishes empty and populated result states', () => {
  assert.deepEqual(
    getSearchViewState({
      query: 'ਇਕ',
      isLoading: false,
      isPending: false,
      error: null,
      resultCount: 0,
    }),
    {
      kind: 'empty',
      hasQuery: true,
    },
  )

  assert.deepEqual(
    getSearchViewState({
      query: 'ਇਕ',
      isLoading: false,
      isPending: false,
      error: null,
      resultCount: 2,
    }),
    {
      kind: 'results',
      hasQuery: true,
    },
  )
})
