// __tests__/setup.ts
// Mock global para evitar problemas de inicialização do Sequelize

// Mock do DataTypes do Sequelize
jest.mock('sequelize', () => {
  const actualSequelize = jest.requireActual('sequelize');
  return {
    ...actualSequelize,
    DataTypes: {
      INTEGER: 'INTEGER',
      STRING: 'STRING',
      TEXT: 'TEXT',
      DATE: 'DATE',
      BOOLEAN: 'BOOLEAN',
      TIME: 'TIME',
      NOW: 'NOW',
    }
  };
});