import type { PackageDependencyHierarchy } from '@pnpm/list'
import type { ProjectManifest } from '@pnpm/types'
import type { ListPackageDependenciesOptions } from '../../types'

import { dirname } from 'pathe'
import { x } from 'tinyexec'

type PnpmPackageNode = Pick<ProjectManifest, 'description' | 'license' | 'author' | 'homepage'> & {
  alias: string | undefined
  version: string
  path: string
  resolved?: string
  from: string
  repository?: string
  dependencies: Record<string, PnpmPackageNode>
}

type PnpmDependencyHierarchy = Pick<PackageDependencyHierarchy, 'name' | 'version' | 'path'> &
  Required<Pick<PackageDependencyHierarchy, 'private'>> & {
    dependencies?: Record<string, PnpmPackageNode>
    devDependencies?: Record<string, PnpmPackageNode>
    optionalDependencies?: Record<string, PnpmPackageNode>
    unsavedDependencies?: Record<string, PnpmPackageNode>
  }

export async function resolveRoot(options: ListPackageDependenciesOptions): Promise<string | undefined> {
  let raw: string | undefined
  try {
    raw = (await x('pnpm', ['root', '-w'], { throwOnError: true, nodeOptions: { cwd: options.cwd } })).stdout.trim()
  }
  catch {
    try {
      raw = (await x('pnpm', ['root'], { throwOnError: true, nodeOptions: { cwd: options.cwd } })).stdout.trim()
    }
    catch (error) {
      console.error('Failed to resolve root directory')
      console.error(error)
    }
  }
  return raw ? dirname(raw) : options.cwd
}

export async function getPnpmVersion(options: ListPackageDependenciesOptions): Promise<string | undefined> {
  try {
    return (await x('pnpm', ['--version'], { throwOnError: true, nodeOptions: { cwd: options.cwd } })).stdout.trim()
  }
  catch (error) {
    console.error('Failed to get pnpm version')
    console.error(error)
    return undefined
  }
}

export async function getDependenciesTree(options: ListPackageDependenciesOptions): Promise<PnpmDependencyHierarchy[]> {
  const args = ['ls', '--json', '--no-optional', '--depth', String(options.depth)]
  if (options.monorepo)
    args.push('--recursive')
  const process = x('pnpm', args, { throwOnError: true, nodeOptions: { stdio: 'pipe', cwd: options.cwd } })
  // eslint-disable ts/no-non-null-asserted-optional-chain
  const json = await import('../../json-parse-stream').then(r => r.jsonParseStream<PnpmDependencyHierarchy[]>(process.process!.stdout!))

  if (!Array.isArray(json))
    throw new Error(`Failed to parse \`pnpm ls\` output, expected an array but got: ${String(json)}`)

  return json
}

// export async function listPackageDependencies(options: ListPackageDependenciesOptions): Promise<ListPackageDependenciesRawResult> {

// }
