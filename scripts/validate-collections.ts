import { readFile } from 'node:fs/promises'
import Ajv from 'ajv/dist/2020.js'
import { Glob } from 'bun'
import consola from 'consola'
import dedent from 'dedent'
import { parse } from 'smol-toml'
const ajv = new Ajv({
  allErrors: true,
})

const SCHEMA_PATH = './collections/$schemas'

const commonSchema = JSON.parse(await readFile(`${SCHEMA_PATH}/common.json`, 'utf-8'))
ajv.addSchema(commonSchema, 'common.json')

const validateCollection = async (schemaFile: string, collectionName: string) => {
  consola.start(`Validating ${collectionName} using ${schemaFile} schema`)

  const schemaContent = JSON.parse(await readFile(`${SCHEMA_PATH}/${schemaFile}`, 'utf-8'))
  const validate = ajv.compile(schemaContent)

  const collectionPath = `./collections/${collectionName}`
  const glob = new Glob(`${collectionPath}/**/*.toml`)
  const collection = glob.scan()

  let hasErrors = false

  for await (const filePath of collection) {
    const data = parse(await readFile(filePath, 'utf-8'))
    const isValid = validate(data)

    const fileName = filePath.replace(`${collectionPath}/`, '')

    if (!isValid) {
      hasErrors = true
      consola.error(
        dedent`Invalid ${collectionName} document: ${fileName}
          ${validate.errors?.map((error) => `- ${error.instancePath || '/'} ${error.message}`).join('\n')}
      `,
      )
    }
  }

  if (!hasErrors) {
    consola.success(`Validated ${collectionName}\n`)
  }

  return !hasErrors
}

const validationConfigs = [
  { schemaFile: 'assets.json', collectionName: 'assets' },
  { schemaFile: 'authors.json', collectionName: 'authors' },
  { schemaFile: 'sources.json', collectionName: 'sources' },
  { schemaFile: 'sections.json', collectionName: 'sections' },
  { schemaFile: 'banis.json', collectionName: 'banis' },
  { schemaFile: 'line-groups.json', collectionName: 'line-groups' },
  { schemaFile: 'lines.json', collectionName: 'lines' },
]

consola.box('Validating collections')

let allSuccess = true
for (const config of validationConfigs) {
  const success = await validateCollection(config.schemaFile, config.collectionName)
  if (!success) allSuccess = false
}

process.exit(allSuccess ? 0 : 1)
