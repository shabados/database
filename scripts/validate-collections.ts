import fg from 'fast-glob'
import { type ObjectEntries, type ObjectSchema, safeParseAsync } from 'valibot'

import { readFile } from 'node:fs/promises'
import chalk from 'chalk'
import dedent from 'dedent'
import { AssetSchema } from '#~/types/collections'

const validateCollection = async (name: string, schema: ObjectSchema<ObjectEntries, undefined>) => {
  console.log(chalk.green(`\nValidating ${name} collection...`))

  const collectionPath = `./collections/${name}`
  const collection = await fg(`${collectionPath}/**/*.json`)

  for (const filePath of collection) {
    const data = JSON.parse(await readFile(filePath, 'utf-8'))
    const result = await safeParseAsync(schema, data)

    const fileName = filePath.replace(`${collectionPath}/`, '')

    if (!result.success) {
      console.error(
        chalk.red(
          dedent`Invalid ${name} document: ${fileName}
          ${result.issues.map((issue) => `- ${issue.message}`).join('\n')}
      `,
        ),
      )
    }
  }
}

await validateCollection('assets', AssetSchema)
