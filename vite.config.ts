import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
  },
  resolve: {
    alias: {
      '@mdxdb/fetch': '/home/ubuntu/repos/mdxdb/packages/fetch/src/index.ts',
    },
  },
})
