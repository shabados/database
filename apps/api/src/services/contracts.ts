import type {
  PangtiSearchQuery,
  PangtiSearchResponse,
  PassageDetailResponse,
  WorkDetailResponse,
  WorksResponse,
} from '@giaan-khand/contracts'

export type SearchService = {
  searchPangtis(query: PangtiSearchQuery): Promise<PangtiSearchResponse>
}

export type WorkRepository = {
  listWorks(): Promise<WorksResponse>
  getWorkDetail(slug: string): Promise<WorkDetailResponse | null>
  getPassageDetail(id: string): Promise<PassageDetailResponse | null>
}

