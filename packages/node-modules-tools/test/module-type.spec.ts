import fse from 'node:fs/promises'
import { resolvePath } from 'mlly'
import { expect, it } from 'vitest'
import { analyzePackageModuleType } from '../src/analyze-esm'

async function getPackageJsonPath(pkg: string) {
  return JSON.parse(await fse.readFile(
    await resolvePath(`${pkg}/package.json`),
    'utf-8',
  ))
}

it('types only', async () => {
  expect(analyzePackageModuleType(await getPackageJsonPath('type-fest'))).toMatchInlineSnapshot(`"dts"`)
  expect(analyzePackageModuleType(await getPackageJsonPath('@types/node'))).toMatchInlineSnapshot(`"dts"`)
})

it('dual', async () => {
  expect(analyzePackageModuleType(await getPackageJsonPath('h3'))).toMatchInlineSnapshot(`"dual"`)
})

it('cjs', async () => {
  expect(analyzePackageModuleType(await getPackageJsonPath('picocolors'))).toMatchInlineSnapshot(`"cjs"`)
})
