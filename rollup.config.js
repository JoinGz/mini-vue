import pkg from './package.json'
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.module, // package.json 中 "module": "lib/index.esm.js"
      format: 'esm',
      sourcemap: true,
    },
    {
      file: pkg.main, // package.json 中 "main": "lib/index.cjs.js",
      format: 'cjs',
      sourcemap: true,
    },
    {
      file: 'lib/index.umd.js',
      name: 'umdFile',
      format: 'umd',
      sourcemap: true,
    },
  ],
  plugins: [
    typescript()
  ],
}

// https://www.philxu.cn/gl-widget-tech/rollup.html#rollup-or-webpack