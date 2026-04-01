export type SearchViewState =
  | {
      kind: 'browse'
      hasQuery: false
    }
  | {
      kind: 'loading'
      hasQuery: true
    }
  | {
      kind: 'error'
      hasQuery: true
      errorMessage: string
    }
  | {
      kind: 'empty'
      hasQuery: true
    }
  | {
      kind: 'results'
      hasQuery: true
    }

export const getSearchViewState = (input: {
  query: string
  isLoading: boolean
  isPending: boolean
  error: string | null
  resultCount: number
}): SearchViewState => {
  if (!input.query.trim()) {
    return {
      kind: 'browse',
      hasQuery: false,
    }
  }

  if (input.isLoading || input.isPending) {
    return {
      kind: 'loading',
      hasQuery: true,
    }
  }

  if (input.error) {
    return {
      kind: 'error',
      hasQuery: true,
      errorMessage: input.error,
    }
  }

  if (input.resultCount === 0) {
    return {
      kind: 'empty',
      hasQuery: true,
    }
  }

  return {
    kind: 'results',
    hasQuery: true,
  }
}
