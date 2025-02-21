import type { NodeModulesInspectorConfig, ServerFunctions } from '#shared/types'
import type { ListPackageDependenciesOptions } from 'node-modules-tools'
import type { ListPackagePublishDatesOptions } from '../shared/publish-date'
import process from 'node:process'

import { listPackageDependencies } from 'node-modules-tools'
import { loadConfig } from 'unconfig'
import { getPackagesPublishDate as _getPackagesPublishDate } from '../shared/publish-date'

export interface CreateServerFunctionsOptions extends Partial<ListPackageDependenciesOptions>, ListPackagePublishDatesOptions {
  mode: 'dev' | 'build'
}

export function createServerFunctions(options: CreateServerFunctionsOptions): ServerFunctions {
  let _config: Promise<NodeModulesInspectorConfig> | null = null
  const getConfig = async (force = false) => {
    if (_config && !force)
      return _config
    _config = (async () => {
      const result = await loadConfig<NodeModulesInspectorConfig>({
        cwd: options.cwd,
        sources: [
          { files: 'node-module-inspector.config' },
        ],
        defaults: {
          fetchPublishDate: false,
        },
        merge: true,
      })
      // if (result.sources.length)
      //   console.log(`[Node Modules Checker] Config loaded from ${result.sources.join(', ')}`)
      // else
      //   console.log(`[Node Modules Checker] No config found`)
      return result.config
    })()
    return _config
  }

  async function getPackagesPublishDate(deps: string[]) {
    const config = await getConfig()
    if (!config.fetchPublishDate)
      return new Map()
    return _getPackagesPublishDate(deps, { storagePublishDates: options.storagePublishDates })
  }

  return {
    // async getPayload(force?: boolean) {
    //   const config = await getConfig(force)
    //   // const excludeFilter = constructPackageFilters(config.excludePackages || [], 'some')
    // },
    async listDependencies() {
      // console.log('[Node Modules Checker] Reading dependencies...')
      return listPackageDependencies({
        cwd: process.cwd(),
        depth: 25,
        monorepo: true,
        ...options,
      })
    },
    getPackagesPublishDate,
    async openInEditor(filename: string) {
      // @ts-expect-error missing types
      await import('launch-editor').then(r => (r.default || r)(filename))
    },
    async openInFinder(filename: string) {
      await import('open').then(r => r.default(filename))
    },
  }
}
