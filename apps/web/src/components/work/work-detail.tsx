import Link from 'next/link'

import type { StructureNodeSummary, WorkSummary } from '@giaan-khand/sdk'

import { buildSearchHref } from '@/lib/routes'
import { buildWorkSubtitle, getWorkTitle, humanizeLabel } from '@/lib/format'

import styles from './work-detail.module.css'

const backIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M14.7 5.29 8 12l6.7 6.71-1.4 1.41L5.17 12l8.13-8.12 1.4 1.41Z" />
  </svg>
)

const chevronRightIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="m9.29 6.71 1.42-1.42L17.41 12l-6.7 6.71-1.42-1.42L14.59 12 9.29 6.71Z" />
  </svg>
)

export type WorkDetailProps = {
  work: WorkSummary
  sections: StructureNodeSummary[]
  searchQuery: string
}

export function WorkDetail({ work, sections, searchQuery }: WorkDetailProps) {
  const backHref = searchQuery.trim() ? buildSearchHref(searchQuery) : '/'

  return (
    <main className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.topbar}>
          <Link className={styles.backButton} href={backHref} aria-label="Back to search">
            {backIcon}
          </Link>

          <div className={styles.copy}>
            <p className={styles.label}>{getWorkTitle(work)}</p>
            <h1 className={styles.title}>{getWorkTitle(work)}</h1>
            <p className={styles.subtitle}>{buildWorkSubtitle(work)}</p>
          </div>
        </div>

        {sections.length ? (
          <div className={styles.grid}>
            {sections.map((section) => {
              const title = section.title.Latn ?? section.title.Guru ?? humanizeLabel(section.nodeType)
              const meta =
                section.translation?.en ??
                section.description?.en ??
                humanizeLabel(section.nodeType)

              return (
                <article className={styles.sectionCard} key={section.id}>
                  <div className={styles.sectionCopy}>
                    <p className={styles.sectionTitle}>{title}</p>
                    <p className={styles.sectionMeta}>{meta}</p>
                  </div>
                  <span className={styles.sectionChevron} aria-hidden="true">
                    {chevronRightIcon}
                  </span>
                </article>
              )
            })}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyCopy}>
              <span aria-hidden="true">⦿</span>
              <strong>Structure content coming soon</strong>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
