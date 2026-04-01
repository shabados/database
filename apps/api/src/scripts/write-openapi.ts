import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { openApiDocument } from '@giaan-khand/contracts'

const outputPath = resolve(process.cwd(), 'openapi.json')

await writeFile(outputPath, JSON.stringify(openApiDocument, null, 2))

console.log(`Wrote OpenAPI document to ${outputPath}`)

