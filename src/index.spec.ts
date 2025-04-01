import { describe, expect, it } from 'bun:test'

import { parse } from 'smol-toml'

import { LineGroups } from '#collections-types/line-groups'

import createDbClient from '.'

const getCollectionDoc = async <Schema>(document: string) =>
  parse(await Bun.file(`collections/${document}.toml`).text()) as Schema

describe('Database', () => {
  it('should return lines in order', async () => {
    const db = createDbClient()
    const id = 'DMP'

    const lineGroup = await db.query.lineGroups.findFirst({
      where: { id },
      with: {
        author: true,
        lines: {
          orderBy: {
            lineGroupOrder: 'asc',
          },
        },
      },
    })

    const collectionDoc = await getCollectionDoc<LineGroups>(`line-groups/D/${id}`)
    expect(lineGroup?.lines.map((line) => line.id)).toEqual(collectionDoc.lines)
  })
})
