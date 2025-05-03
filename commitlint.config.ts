import conventional from '@commitlint/config-angular'
import { RuleConfigSeverity, type UserConfig } from '@commitlint/types'

export default {
  extends: ['@commitlint/config-angular'],
  rules: {
    'type-enum': [
      RuleConfigSeverity.Error,
      'always',
      [...conventional.rules['type-enum'][2], 'data'],
    ],
  },
} satisfies UserConfig
