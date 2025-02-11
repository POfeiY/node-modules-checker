import { fileURLToPath } from 'node:url'
import alias from '@rollup/plugin-alias'
import commonjs from '@rollup/plugin-commonjs'
import nodeResolve from '@rollup/plugin-node-resolve'
import { defineConfig } from 'rollup'
import esbuild from 'rollup-plugin-esbuild'

export default defineConfig({
  input: '',
  output: {
    file: './runtime/webcontainer-server.mjs',
    format: 'es',
    inlineDynamicImports: true,
  },
  plugins: [
    alias({
      entries: {
        'node-modules-tools': fileURLToPath(new URL('../node-modules-tools/src/index.ts'), import.meta.url),
      },
    }),
    commonjs(),
    nodeResolve({
      preferBuiltins: true,
    }),
    esbuild({
      minifyWhitespace: true,
      target: 'es2022',
    }),
  ],
})
