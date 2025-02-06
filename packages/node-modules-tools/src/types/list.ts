import type { BaseOptions } from './base'
import type { PackageNode, PackageNodeBase, PackageNodeRaw } from './node'

export interface ListPackageDependenciesOptions extends BaseOptions {
  /**
   * Depth of the dependency tree
   */
  depth: number
  /**
   * Should it list dependencies of all packages in the monorepo
   */
  monorepo: boolean
  /**
   * Filter if a packages should be included and continue traversing
   * @param node
   * @returns
   */
  traverseFilter?: (node: PackageNodeRaw) => boolean
}

export interface ListPackageDependenciesRawResult {
  root: string
  packageManager: string
  packageManagerVersion: string
  packages: Map<string, PackageNodeRaw>
}

export interface ListPackageDependenciesBaseResult extends ListPackageDependenciesRawResult {
  packages: Map<string, PackageNodeBase>
}

export interface LIstPackageDependenciesResult extends ListPackageDependenciesBaseResult {
  packages: Map<string, PackageNode>
}
