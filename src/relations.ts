import { defineRelations } from 'drizzle-orm'

import * as schema from './schema'

export default defineRelations(schema, (r) => ({
  sources: {
    sections: r.many.sections({
      from: r.sources.id,
      to: r.sections.sourceId,
    }),
  },
  sections: {
    source: r.one.sources({
      optional: false,
      from: r.sections.sourceId,
      to: r.sources.id,
    }),
    lineGroups: r.many.lineGroups({
      from: r.sections.id,
      to: r.lineGroups.sectionId,
    }),
  },
  authors: {
    lineGroups: r.many.lineGroups({
      from: r.authors.id,
      to: r.lineGroups.authorId,
    }),
  },
  lineGroups: {
    section: r.one.sections({
      optional: false,
      from: r.lineGroups.sectionId,
      to: r.sections.id,
    }),
    author: r.one.authors({
      optional: false,
      from: r.lineGroups.authorId,
      to: r.authors.id,
    }),
    lines: r.many.lines({
      from: r.lineGroups.id,
      to: r.lines.lineGroupId,
    }),
  },
  lines: {
    lineGroup: r.one.lineGroups({
      optional: false,
      from: r.lines.lineGroupId,
      to: r.lineGroups.id,
    }),
    assetContent: r.many.assetLines({
      from: r.lines.id,
      to: r.assetLines.lineId,
    }),
  },
  assetLines: {
    line: r.one.lines({
      optional: false,
      from: r.assetLines.lineId,
      to: r.lines.id,
    }),
    asset: r.one.assets({
      optional: false,
      from: r.assetLines.assetId,
      to: r.assets.id,
    }),
  },
  assets: {
    lines: r.many.assetLines({
      from: r.assets.id,
      to: r.assetLines.assetId,
    }),
  },
  baniLines: {
    bani: r.one.banis({
      optional: false,
      from: r.baniLines.baniId,
      to: r.banis.id,
    }),
    line: r.one.lines({
      optional: false,
      from: r.baniLines.lineId,
      to: r.lines.id,
    }),
  },
  banis: {
    lines: r.many.baniLines({
      from: r.banis.id,
      to: r.baniLines.baniId,
    }),
  },
}))
