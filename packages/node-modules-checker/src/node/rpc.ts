import type { NodeModulesInspectorConfig, ServerFunctions } from '#shared/types'
import type { ListPackageDependenciesOptions } from 'node-modules-tools'
import type { ListPackagePublishDatesOptions } from '../shared/publish-dates'
import process from 'node:process'

import { constructPackageFilters, listPackageDependencies } from 'node-modules-tools'
import { hash as getHash } from 'ohash'
import { loadConfig } from 'unconfig'

import { getPackagesPublishDate as _getPackagesPublishDate } from '../shared/publish-dates'

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
          { files: 'node-modules-inspector.config' },
        ],
        defaults: {
          fetchPublishDate: false,
        },
        merge: true,
      })
      if (result.sources.length)
        console.log(`[Node Modules Checker] Config loaded from ${result.sources.join(', ')}`)
      else
        console.log(`[Node Modules Checker] No config found`)
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
    async getPayload(force?: boolean) {
      const config = await getConfig(force)
      const excludeFilter = constructPackageFilters(config.excludePackages || [], 'some')
      const depsFilter = constructPackageFilters(config.excludeDependenciesOf || [], 'some')
      console.log('[Node Modules Checker] Reading dependencies...')
      const result = await listPackageDependencies({
        cwd: process.cwd(),
        depth: 25,
        monorepo: true,
        ...options,
        traverseFilter(node) {
          return !excludeFilter(node)
        },
        dependenciesFilter(node) {
          return !depsFilter(node)
        },
      })

      const hash = getHash([...result.packages.keys()].sort())

      if (options.mode === 'build' && config.fetchPublishDate) {
        try {
          await getPackagesPublishDate(Array.from(result.packages.keys()))
        }
        catch (error) {
          console.error('[Node Modules Checker] fail to fetch publish dates')
          console.error(error)
        }
      }

      await Promise.all(Array.from(result.packages.values())
        .map(async (pkg) => {
          const time = await options.storagePublishDates.getItem(pkg.spec)
          if (time)
            pkg.resolved.publishTime = time
        }))

      return {
        hash,
        timestamp: Date.now(),
        ...result,
        config,
      }
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
