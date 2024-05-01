import { defineConfig } from 'vitest/config';
export default defineConfig({
  define: {
    __DEV__: true,
    __BROWSER__: true,
  },
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['**/scripts/**', '**/unplugin/**', '**/*.d.ts', '**/index.ts'],
    },
    globals: true,
    environment: 'jsdom',
    watch: false,
  },
});
