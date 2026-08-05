import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    // O Vitest por padrão já procura arquivos .spec.ts, 
    // mas agora ele os encontrará dentro da pasta /test
    include: ['test/**/*.spec.ts'], 
  },
});