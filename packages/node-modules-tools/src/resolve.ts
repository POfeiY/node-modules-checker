/**
 * Analyze a package node, and return a resolved package node.
 * This function mutates the input package node.
 *
 * - Set `module` to the resolved module type (cjs, esm, dual, faux, none).
 */

import type { PackageJson } from 'pkg-types'
import type { BaseOptions, PackageNode, PackageNodeBase } from './types'

import fse from 'node:fs/promises'
import { join } from 'node:path'
import { analyzePackageModuleType } from './analyze-esm'
import { getPackagesInstallSize } from './size'
import { stripBomTag } from './utils'

export async function resolvePackage(_packageManager: string, pkg: PackageNodeBase, _options: BaseOptions): Promise<PackageNode> {
  const _pkg = pkg as unknown as PackageNode
  if (_pkg.resolved)
    return _pkg

  const content = await fse.readFile(join(pkg.filePath, 'package.json'), 'utf-8')
  const json = JSON.parse(stripBomTag(content)) as PackageJson

  let repository = typeof json.repository === 'string' ? json.repository : json.repository?.url
  if (repository?.startsWith('git+'))
    repository = repository.slice(4)
  if (repository?.endsWith('.git'))
    repository = repository.slice(0, -4)
  if (repository?.startsWith('git://'))
    repository = repository.slice(6)
  if (json.repository && typeof json.repository !== 'string' && json.repository.directory)
    repository += `/tree/HEAD/${json.repository.directory}`

  _pkg.resolved = {
    module: analyzePackageModuleType(json),
    engines: json.engines,
    license: json.license,
    author: typeof json.author === 'string' ? json.author : json.author?.url,
    repository,
    homepage: json.homepage,
    installSize: await getPackagesInstallSize(_pkg),
  }

  return _pkg
}
