import { SearchExperience } from '@/components/search/search-experience'
import { createApiClient } from '@giaan-khand/sdk'

const client = createApiClient()

export default async function HomePage() {
  const featuredWorks = await client.listWorks().then((response) => response.items).catch(() => [])

  return <SearchExperience featuredWorks={featuredWorks} initialQuery="" mode="home" />
}
