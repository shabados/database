import { redirect } from 'next/navigation'

import { SearchExperience } from '@/components/search/search-experience'
import { createApiClient } from '@giaan-khand/sdk'

const client = createApiClient()

type SearchPageProps = {
  searchParams: Promise<{
    q?: string | string[]
  }>
}

const getFirstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? '' : value ?? ''

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = getFirstValue(q).trim()

  if (!query) {
    redirect('/')
  }

  const [featuredWorks, initialResults] = await Promise.all([
    client.listWorks().then((response) => response.items).catch(() => []),
    client.searchPangtis({ q: query, limit: 24 }).then((response) => response.items).catch(() => []),
  ])

  return (
    <SearchExperience
      featuredWorks={featuredWorks}
      initialQuery={query}
      initialResults={initialResults}
      mode="search"
    />
  )
}
