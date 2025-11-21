/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Configuração moderna do ts-jest
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },
  
  // Padrões de arquivos de teste
  testMatch: [
    "**/__tests__/**/*.test.ts",
    "**/__tests__/**/*.spec.ts",
    "**/src/**/*.test.ts", 
    "**/src/**/*.spec.ts"
  ],
  
  // Pastas a serem ignoradas
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/",
    "/build/"
  ],

  // Extensões de arquivo a serem consideradas
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Mapeamento de módulos (nome correto)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  collectCoverage: true,
  coverageDirectory: "coverage",
  
  // Configurações de cobertura
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
    "!src/**/types.ts"
  ]
};