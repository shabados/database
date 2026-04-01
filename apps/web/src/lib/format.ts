import type { PangtiSearchItem, WorkSummary } from '@giaan-khand/sdk'

const titleFromField = (field: Record<string, string> | null | undefined, fallback: string) =>
  field?.Latn ?? field?.Guru ?? Object.values(field ?? {})[0] ?? fallback

export const humanizeLabel = (value: string) =>
  value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1).toLowerCase())
    .join(' ')

export const formatCount = (count: number, singular: string, plural: string) =>
  `${count} ${count === 1 ? singular : plural}`

export const getWorkTitle = (work: WorkSummary) =>
  titleFromField(work.title, humanizeLabel(work.slug))

export const getWorkDescription = (work: WorkSummary) =>
  work.translation?.en ?? work.summary?.en ?? humanizeLabel(work.classification)

export const getResultTitle = (item: PangtiSearchItem) => item.workTitle

export const getStructureTitle = (item: PangtiSearchItem) => item.structureLabel

export const buildResultMeta = (item: PangtiSearchItem) => {
  const matchedInitials = item.matchedInitials || 'none'

  return `${item.locatorLabel} • ${item.matchedBy} • ${matchedInitials}`
}

export const buildWorkSubtitle = (work: WorkSummary) =>
  work.summary?.en ?? humanizeLabel(work.textShape)
