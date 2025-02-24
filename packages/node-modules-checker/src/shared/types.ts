import type { ListPackageDependenciesResult, PackageNodeRaw } from 'node-modules-tools'

import type { FilterOptions } from './filters'

export interface NodeModulesInspectorPayload extends ListPackageDependenciesResult {
  timestamp: number
  hash: string
  config?: NodeModulesInspectorConfig
}

export interface ServerFunctions {
  getPayload: (force?: boolean) => Promise<NodeModulesInspectorPayload>
  getPackagesPublishDate: (deps: string[]) => Promise<Map<string, string>>
  openInEditor: (filename: string) => void
  openInFinder: (filename: string) => void
}

export interface NodeModulesInspectorConfig {
  /**
   * The name of the package
   */
  name?: string
  /**
   * Fetch publish date of the packages
   *
   * @default true
   */
  fetchPublishDate?: boolean
  /**
   * Exclude the packages and it's dependencies
   */
  excludePackages?: (string | ((node: PackageNodeRaw) => boolean))[]
  /**
   * Present the packages matched as no dependencies
   */
  excludeDependenciesOf?: (string | ((node: PackageNodeRaw) => boolean))[]
  /**
   * Default filters for the frontend
   */
  defaultFilters?: Partial<FilterOptions>
  defaultSettings?: Partial<SettingsOptions>
}

export interface SettingsOptions {
  moduleTypeSimple: boolean
  moduleTypeRender: 'badge' | 'circle' | 'none'
  deepDependenciesTree: boolean
  packageDetailsTab: 'dependencies' | 'dependents'
  colorizePackageSize: boolean
  showInstallSizeBadge: boolean
  showPublishTimeBadge: boolean
  showFileComposition: boolean
  treatFauxAsESm: boolean
}

export type RemoveVoidKeysFromObject<T> = { [K in keyof T]: T[K] extends void ? never : K } extends { [_ in keyof T]: never }
  ? T
  : { [K in keyof T as T[K] extends void ? never : K]: T[K] }

export interface ClientFunctions {}

export type ServerFunctionsDump = RemoveVoidKeysFromObject<{
  [K in keyof ServerFunctions]: Awaited<ReturnType<ServerFunctions[K]>>
}>

export interface ConnectionMeta {
  websocket: number
}
