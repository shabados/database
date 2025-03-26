import { readFile } from 'node:fs/promises'
import Ajv from 'ajv/dist/2020.js'
import chalk from 'chalk'
import dedent from 'dedent'
import fg from 'fast-glob'

const ajv = new Ajv({
  allErrors: true,
})

const SCHEMA_PATH = './collections/$schemas'

const commonSchema = JSON.parse(await readFile(`${SCHEMA_PATH}/common.json`, 'utf-8'))
ajv.addSchema(commonSchema)

const validateCollection = async (schemaFile: string, collectionName: string) => {
  console.log(
    chalk.green(`\nValidating ${collectionName} collection using ${schemaFile} schema...`),
  )

  const schemaContent = JSON.parse(await readFile(`${SCHEMA_PATH}/${schemaFile}`, 'utf-8'))
  const validate = ajv.compile(schemaContent)

  const collectionPath = `./collections/${collectionName}`
  const collection = await fg(`${collectionPath}/**/*.json`)

  let hasErrors = false

  for (const filePath of collection) {
    const data = JSON.parse(await readFile(filePath, 'utf-8'))
    const isValid = validate(data)

    const fileName = filePath.replace(`${collectionPath}/`, '')

    if (!isValid) {
      hasErrors = true
      console.error(
        chalk.red(
          dedent`Invalid ${collectionName} document: ${fileName}
          ${validate.errors?.map((error) => `- ${error.instancePath || '/'} ${error.message}`).join('\n')}
      `,
        ),
      )
    }
  }

  if (!hasErrors) {
    console.log(chalk.green(`✓ All ${collectionName} documents are valid`))
  }

  return !hasErrors
}

const validationConfigs = [
  { schemaFile: 'assets.json', collectionName: 'assets' },
  { schemaFile: 'authors.json', collectionName: 'authors' },
  { schemaFile: 'sources.json', collectionName: 'sources' },
  { schemaFile: 'sections.json', collectionName: 'sections' },
  { schemaFile: 'line-groups.json', collectionName: 'line-groups' },
  { schemaFile: 'lines.json', collectionName: 'lines' },
]

let allSuccess = true
for (const config of validationConfigs) {
  const success = await validateCollection(config.schemaFile, config.collectionName)
  if (!success) allSuccess = false
}

process.exit(allSuccess ? 0 : 1)
