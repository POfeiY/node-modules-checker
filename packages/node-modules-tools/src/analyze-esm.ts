import type { PackageJson } from 'pkg-types'
import type { PackageModuleType } from './types'

export function analyzePackageModuleType(pkgJson: PackageJson): PackageModuleType {
  if (pkgJson.name?.startsWith('@types/'))
    return 'dts'
}
