import {
  defineConfig
} from 'vite'
import AutoImport from 'unplugin-auto-import/vite'
import vue from '@vitejs/plugin-vue'
import glsl from 'vite-plugin-glsl';
import {
  resolve
} from 'path';

const pathResolve = (dir) => {
  return resolve(__dirname, '.', dir);
};

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      '@': pathResolve('src'),
    }
  },
  plugins: [glsl({
    include: [ // Glob pattern, or array of glob patterns to import
      '**/*.glsl', '**/*.wgsl',
      '**/*.vert', '**/*.frag',
      '**/*.vs', '**/*.fs'
    ],
    exclude: undefined, // Glob pattern, or array of glob patterns to ignore
    warnDuplicatedImports: true, // Warn if the same chunk was imported multiple times
    defaultExtension: 'glsl', // Shader suffix when no extension is specified
    compress: false, // Compress output shader code
    watch: true, // Recompile shader on change
    root: '/src/assets' // Directory for root imports
  }), vue(),AutoImport({imports: [
    'vue', 'vue-router',
  ],})],
})