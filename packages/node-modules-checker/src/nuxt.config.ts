// import { fileURLToPath } from "mlly"

// const NUXT_DEBUG_BUILD = !!process.env.NUXT_DEBUG_BUILD
// const backend = process.env.NMI_BACKEND ?? 'dev'
// const isWebContainer = backend === 'webcontainer'

// const headers = isWebContainer
//   ? {
//       'Cross-Origin-Embedder-Policy': 'require-corp',
//       'Cross-Origin-Opener-Policy': 'same-origin',
//     }
//   : {}

// export default defineNuxtConfig({
//   ssr: false,
//   moudles: [],
//   alias: {
//     'node-modules-tools': fileURLToPath(new URL('../../node-modules-tools/src/index.ts', import.meta.url))
//   },
//   logLevel: 'verbose',
//   srcDir: 'app',
//   eslint: {},
//   experimental: {},
//   features: {},
//   css: {},
//   nitro: {},
//   app: {},
//   vite: {},
//   devtools: {},
//   typescrip: {
//     includeWorkspace: true,
//   },
// })
