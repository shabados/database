'use client'

import { useDeferredValue, useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createApiClient, type PangtiSearchItem, type WorkSummary } from '@giaan-khand/sdk'

import { buildSearchHref, buildWorkHref } from '@/lib/routes'
import {
  buildResultMeta,
  formatCount,
  getResultTitle,
  getStructureTitle,
  getWorkDescription,
  getWorkTitle,
} from '@/lib/format'
import { getSearchViewState } from '@/lib/search-state'

import styles from './search-experience.module.css'

type SearchExperienceProps = {
  mode: 'home' | 'search'
  featuredWorks: WorkSummary[]
  initialQuery: string
  initialResults?: PangtiSearchItem[]
}

const client = createApiClient()

const searchIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M10.5 4.5a6 6 0 104.03 10.45l4.26 4.27 1.41-1.42-4.26-4.26A6 6 0 0010.5 4.5Zm0 2a4 4 0 110 8 4 4 0 010-8Z"
    />
  </svg>
)

const cardIcon = (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path
      fill="currentColor"
      d="M5.83 4.58c0-.46.38-.83.84-.83h4.08c.77 0 1.48.28 2.04.76.55-.48 1.26-.76 2.03-.76h.01c.46 0 .83.37.83.83v9.17a.83.83 0 0 1-1.24.72 3.37 3.37 0 0 0-1.69-.47h-.28c-.72 0-1.4.24-1.95.68a.83.83 0 0 1-1.04 0 3.1 3.1 0 0 0-1.95-.68h-.28c-.59 0-1.17.16-1.69.47a.83.83 0 0 1-1.24-.72V4.58Zm1.67.83v7.24c.28-.05.56-.08.84-.08h.28c.59 0 1.16.1 1.71.31V5.42H7.5Zm4.5 7.46c.54-.2 1.11-.31 1.7-.31h.29c.28 0 .56.03.84.08V5.42H13.7c-.63 0-1.24.24-1.7.67v6.78Z"
    />
  </svg>
)

const chevronRightIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="m9.29 6.71 1.42-1.42L17.41 12l-6.7 6.71-1.42-1.42L14.59 12 9.29 6.71Z" />
  </svg>
)

const loadingSpinner = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"
    />
  </svg>
)

export function SearchExperience({
  featuredWorks,
  initialQuery,
  initialResults = [],
  mode,
}: SearchExperienceProps) {
  const router = useRouter()
  const [query, setQuery] = useState(initialQuery)
  const deferredQuery = useDeferredValue(query)
  const [results, setResults] = useState<PangtiSearchItem[]>(initialResults)
  const [total, setTotal] = useState(initialResults.length)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const searchTimer = useRef<number | null>(null)
  const requestId = useRef(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const didMount = useRef(false)

  const hasQuery = query.trim().length > 0

  useEffect(() => {
    if (searchTimer.current) {
      window.clearTimeout(searchTimer.current)
    }

    if (!didMount.current) {
      didMount.current = true
      return
    }

    const nextHref = buildSearchHref(query)
    searchTimer.current = window.setTimeout(() => {
      startTransition(() => {
        router.replace(nextHref)
      })
    }, 180)

    return () => {
      if (searchTimer.current) {
        window.clearTimeout(searchTimer.current)
      }
      searchTimer.current = null
    }
  }, [query, router, startTransition])

  useEffect(() => {
    const trimmedQuery = deferredQuery.trim()
    const currentRequest = ++requestId.current

    if (!trimmedQuery) {
      setResults([])
      setTotal(0)
      setError(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    client
      .searchPangtis({ q: trimmedQuery, limit: 24 })
      .then((response) => {
        if (currentRequest !== requestId.current) {
          return
        }

        setResults(response.items)
        setTotal(response.queryMeta.total)
        setIsLoading(false)
      })
      .catch((cause: unknown) => {
        if (currentRequest !== requestId.current) {
          return
        }

        setResults([])
        setTotal(0)
        setIsLoading(false)
        setError(cause instanceof Error ? cause.message : 'Search request failed')
      })
  }, [deferredQuery])

  const quickLinks = useMemo(() => featuredWorks.slice(0, 4), [featuredWorks])
  const viewState = getSearchViewState({
    query,
    isLoading,
    isPending,
    error,
    resultCount: results.length,
  })

  return (
    <main
      className={styles.page}
      data-mode={mode}
      data-has-query={hasQuery ? 'true' : 'false'}
      aria-labelledby="page-title"
    >
      <section className={styles.shell}>
        <div className={styles.hero}>
          <div className={styles.heroRow}>
            <div className={styles.heroMark} aria-hidden="true">
              {cardIcon}
            </div>
            <h1 className={styles.title} id="page-title">
              Giaan Khand
            </h1>
          </div>
          <p className={styles.gurmukhi}>ਗਿਆਨ ਖੰਡ ਕਾ ਆਖਹੁ ਕਰਮੁ ॥</p>
        </div>

        <form
          className={styles.searchForm}
          role="search"
          onSubmit={(event) => {
            event.preventDefault()
            startTransition(() => {
              router.push(buildSearchHref(query))
            })
          }}
        >
          <div className={styles.searchFrame}>
            <span className={styles.searchIcon} aria-hidden="true">
              {searchIcon}
            </span>
              <input
                ref={inputRef}
                className={styles.input}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by first letter..."
              autoComplete="off"
              spellCheck={false}
              aria-label="Search granths by pangti initials"
            />
            {hasQuery ? (
              <button
                className={styles.clearButton}
                type="button"
                onClick={() => {
                  setQuery('')
                  inputRef.current?.focus()
                }}
                aria-label="Clear search"
              >
                Clear
              </button>
            ) : (
              <span className={styles.shortcutHint} aria-hidden="true">
                /
              </span>
            )}
          </div>
          <p className={styles.hint}>Type the first letter of each word to search Gurbani</p>
        </form>

        <section className={styles.content}>
          {viewState.kind === 'browse' ? (
            <div className={styles.quickLinks} aria-label="Featured granths">
              {quickLinks.map((work) => (
                <button
                  key={work.slug}
                  className={styles.quickCard}
                  type="button"
                  onClick={() => {
                    startTransition(() => {
                      router.push(buildWorkHref(work.slug, query))
                    })
                  }}
                >
                  <div className={styles.quickCardTop}>
                    <div>
                      <h2 className={styles.quickCardTitle}>{getWorkTitle(work)}</h2>
                      <p className={styles.quickCardDescription}>{getWorkDescription(work)}</p>
                    </div>
                    <span className={styles.quickCardIcon} aria-hidden="true">
                      {cardIcon}
                    </span>
                  </div>
                </button>
              ))}

              <button
                className={`${styles.quickCard} ${styles.quickCardGhost}`}
                type="button"
                onClick={() => {
                  inputRef.current?.focus()
                }}
              >
                <span className={styles.quickCardGhostLabel}>
                  View all Granths
                  <span aria-hidden="true">{chevronRightIcon}</span>
                </span>
              </button>
            </div>
          ) : (
            <div>
              <div className={styles.resultsHeader}>
                <p className={styles.resultsCount}>{formatCount(total, 'Result', 'Results')}</p>
              </div>

              {viewState.kind === 'loading' ? (
                <div className={styles.stateMessage}>
                  <div className={styles.stateMessageCopy}>
                    <span className={styles.stateMessageIcon}>
                      <span className={styles.spinner}>{loadingSpinner}</span>
                    </span>
                    <strong>Loading pangti results...</strong>
                  </div>
                </div>
              ) : viewState.kind === 'error' ? (
                <div className={styles.stateMessage}>
                  <div className={styles.stateMessageCopy}>
                    <span className={styles.stateMessageIcon}>{searchIcon}</span>
                    <strong>Search request failed</strong>
                    <p>{viewState.errorMessage}</p>
                  </div>
                </div>
              ) : viewState.kind === 'empty' ? (
                <div className={styles.stateMessage}>
                  <div className={styles.stateMessageCopy}>
                    <span className={styles.stateMessageIcon}>{searchIcon}</span>
                    <strong>No results found</strong>
                    <p>Try adjusting your initials query</p>
                  </div>
                </div>
              ) : (
                <div className={styles.resultsList}>
                  {results.map((item) => (
                    <button
                      key={item.passageId}
                      className={styles.resultCard}
                      type="button"
                      onClick={() => {
                        startTransition(() => {
                          router.push(buildWorkHref(item.workSlug, query))
                        })
                      }}
                    >
                      <p className={styles.resultCardTitle}>{item.originalText}</p>
                      <div className={styles.resultCardMeta}>
                        <div className={styles.resultCardRow}>
                          <span className={styles.resultCardLabel}>{getResultTitle(item)}</span>
                          <span className={styles.resultCardGloss}>{getStructureTitle(item)}</span>
                        </div>
                        <div className={styles.resultCardFooter}>
                          <span className={styles.resultCardMarker} aria-hidden="true" />
                          <span>{buildResultMeta(item)}</span>
                          <span className={styles.badge}>{item.locatorLabel}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                  <div className={styles.resultsFooter}>End of results</div>
                </div>
              )}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}
