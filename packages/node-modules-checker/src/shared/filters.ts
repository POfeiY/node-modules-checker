import type { PackageModuleType } from 'node-modules-tools'

export interface FilterOptions {
  'search': string
  'modules': null | PackageModuleType[]
  'focus': null | string[]
  'why': null | string[]
  'excludes': null | string[]
  'exclude-dts': boolean
  'exclude-private': boolean
  'exclude-workspace': boolean
  'source-type': null | 'prod' | 'dev'

  'compare-a': null | string[]
  'compare-b': null | string[]
}
