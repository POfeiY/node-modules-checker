import type { PackageInstallSizeInfo, PackageNodeRaw } from './types'
import fse from 'node:fs/promises'
import { join } from 'pathe'

export async function getPackagesInstallSize(pkg: PackageNodeRaw): Promise<PackageInstallSizeInfo | undefined> {
  if (pkg.workspace)
    return
  if (pkg.name.startsWith('#'))
    return
  if (pkg.version.match(/^(?:file|link|workspace):/))
    return

  const root = pkg.filePath
  const files: string[] = []

  await traverse(root)

  // const types = files.map(f => )

  /* eslint-disable ts/explicit-function-return-type */
  async function traverse(dir: string) {
    for (const n of await fse.readdir(dir, { withFileTypes: true })) {
      if (n.isFile()) {
        files.push(join(dir, n.name))
      }
      else if (n.isDirectory()) {
        if (n.name.match(/^\.|^node_modules$/))
          continue
        traverse(join(dir, n.name))
      }
    }
  }
}

export async function guessFileCategory(file: string): Promise<string | undefined> {
  const parts = file.split(/\/|\\/g)
  const dirs = parts.slice(0, -1)
  const base = parts.at(-1)

  if (dirs.some(d => d.match(/^(?:test|tests|__tests__)$/)))
    return 'test'
  if (dirs.some(d => d.match(/^(?:bin|binary)$/)))
    return 'bin'
  if (dirs.some(d => d.match(/^\.\w/) || base?.startsWith('.')))
    return 'other'

  if (dirs.some(d => d.match(/\.(?:test|tests|spec|specs)\.\w+$/i)))
    return 'test'
}
