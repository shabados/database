import { notFound } from 'next/navigation'
import { createApiClient } from '@giaan-khand/sdk'

import { WorkDetail } from '@/components/work/work-detail'

const client = createApiClient()

type WorkPageProps = {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    q?: string | string[]
  }>
}

const getFirstValue = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] ?? '' : value ?? ''

export default async function WorkPage({ params, searchParams }: WorkPageProps) {
  const { slug } = await params
  const { q } = await searchParams
  const query = getFirstValue(q).trim()

  try {
    const { work, sections } = await client.getWork(slug)

    return <WorkDetail work={work} sections={sections} searchQuery={query} />
  } catch {
    notFound()
  }
}
