/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/.next/standalone/',
    '<rootDir>/node_modules/',
  ],
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/app/layout.tsx'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/app/',
    '/lib/',
    '/components/MainLayout',
    '/components/Sidebar',
    '/components/ui/index',
    '/components/ui/UsuarioList',
    '/components/ui/RestauranteForm',
    '/components/ui/RestauranteList',
    '/components/seo/',
    '/proxy.ts',
  ],
};

module.exports = config;
