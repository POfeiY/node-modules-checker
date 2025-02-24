// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu()
  .append({
    files: ['packages/node-modules-checker/src/node/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  })
