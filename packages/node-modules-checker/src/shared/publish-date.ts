import type { Storage } from 'unstorage'
import { getLatestVersionBatch } from 'fast-npm-meta'
import plimit from 'p-limit'

export interface ListPackagePublishDatesOptions {
  storage: Storage<string>
}

export async function getPackagesPublishDate(
  packages: string[],
  options: ListPackagePublishDatesOptions,
) {
  const { storage } = options

  const map = new Map<string, string>()

  const know = await storage.keys()
  const unknow = packages.filter(p => !know.includes(p))

  const BATCH_SIZE = 5
  const limit = plimit(10)
  const promises: Promise<void>[] = []

  for (let idx = 0; idx < unknow.length; idx += BATCH_SIZE) {
    const specs = unknow.slice(idx, idx + BATCH_SIZE)
    promises.push(limit(async () => {
      try {
        const result = await getLatestVersionBatch(specs)
        for (const r of result) {
          if (r.publishedAt) {
            const spec = `${r.name}@${r.version}`
            map.set(spec, r.publishedAt)
            await storage.setItem(spec, r.publishedAt)
          }
        }
      }
      catch (err) {
        console.error('Fail to get package publish date', specs)
        console.error(err)
      }
    }))
  }

  await Promise.all(promises)

  await Promise.all(packages.map(async (p) => {
    if (!map.has(p)) {
      const date = await storage.getItem(p)
      if (date)
        map.set(p, date)
    }
  }))

  return map
}
