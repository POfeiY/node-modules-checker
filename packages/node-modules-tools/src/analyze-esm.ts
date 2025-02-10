import type { PackageJson } from 'pkg-types'
import type { PackageModuleType } from './types'

export function analyzePackageModuleType(pkgJson: PackageJson): PackageModuleType {
  if (pkgJson.name?.startsWith('@types/'))
    return 'dts'

  const { main, exports, type } = pkgJson

  let cjs: boolean | undefined
  let esm: boolean | undefined
  let fauxEsm: boolean | undefined

  if (pkgJson.module)
    fauxEsm = true

  // Checking exports map.
  if (exports && typeof exports === 'object') {
    for (const exportId in exports) {
      if (Object.hasOwn(exports, exportId) && typeof exportId === 'string') {
        // @ts-expect-error indexing on object is fine
        const value = /** @type unknown */ (exports[exportId])
        analyzeThing(value, `${pkgJson.name}#exports`)
      }
    }
  }

  // Explicit `commonjs` set, with a explicit `import` or `.mjs` too.
  if (esm && type === 'commonjs')
    cjs = true
  // Explicit `module` set, with a explicit `require` or `.cjs` too.
  if (cjs && type === 'module')
    esm = true

  // If there are no explicit exports
  if (cjs === undefined && esm === undefined) {
    if (type === 'module' && (main && /\.mjs/.test(main)))
      esm = true
    else if (main)
      cjs = true
  }

  if (esm && cjs)
    return 'dual'
  if (esm)
    return 'esm'
  if (fauxEsm)
    return 'faux'
  if (!esm && !cjs && !pkgJson.main && !pkgJson.exports && !pkgJson.types)
    return 'dts'
  return 'cjs'

  function analyzeThing(value: any, path: string): void {
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        const values = /** @type {Array<unknow>} */ (value)
        let index = -1
        while (++index < values.length) {
          analyzeThing(values[index], `${path}[${index}]`)
        }
      }
      else {
        // cast as indexing on object is fine
        const record = /** @type {Record<string, unknow>} */ (value)
        let dot = false
        for (const [key, subvalue] of Object.entries(record)) {
          if (key.charAt(0) !== '.')
            break
          analyzeThing(subvalue, `${path}["${key}"]`)
          dot = true
        }

        if (dot)
          return

        let explicit = false

        const conditionImport = Boolean('import' in record && record.import)
        const conditionRequire = Boolean('require' in record && record.require)
        const conditionDefault = Boolean('default' in record && record.default)

        if (conditionImport || conditionRequire)
          explicit = true

        if (conditionImport || (conditionRequire && conditionDefault))
          esm = true

        if (conditionRequire || (conditionImport && conditionDefault))
          cjs = true

        const defaults = record.node || record.default

        if (typeof defaults === 'string' || !explicit) {
          if (/\.mjs$/.test(defaults))
            esm = true
          if (/\.cjs/.test(defaults))
            cjs = true
        }
      }
    }
    else if (typeof value === 'string') {
      if (/\.mjs$/.test(value))
        esm = true
      if (/\.cjs/.test(value))
        cjs = true
    }
    else if (value === null) {
      // TODO:something explicitly not available
    }
    else {
      console.error('unknown:,', [value], path)
    }
  }
}
