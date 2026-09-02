import { defineConfig } from 'vite';
import uniPlugin from '@dcloudio/vite-plugin-uni';

const uni = (uniPlugin as { default?: typeof uniPlugin }).default ?? uniPlugin;

export default defineConfig({
  plugins: uni(),
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@import "uview-plus/theme.scss";',
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  optimizeDeps: {
    include: ['uview-plus'],
  },
});
