import { describe, expect, it } from 'vitest'
import { constructPackageFilter } from '../src'

describe('constructPackageFilter', () => {
  it('exact', () => {
    const filter = constructPackageFilter('foo@1.0.0')
    expect(filter({ name: 'foo', version: '1.0.0' })).toBe(true)
    expect(filter({ name: 'foo', version: '2.0.0' })).toBe(false)
  })

  it('exact scope', () => {
    const filter = constructPackageFilter('@foo/bar@1.0.0')
    expect(filter({ name: '@foo/bar', version: '1.0.0' })).toBe(true)
    expect(filter({ name: '@foo/bar', version: '2.0.0' })).toBe(false)
  })

  it('any version', () => {
    const filter = constructPackageFilter('foo')
    expect(filter({ name: 'foo', version: '1.0.0' })).toBe(true)
    expect(filter({ name: 'foo', version: '2.0.0' })).toBe(true)
  })
})
