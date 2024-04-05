// jest.config.js
// eslint-disable-next-line no-undef
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/../.env/test.env'],
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@root(.*)$': '<rootDir>/$1',
    '^@core(.*)$': '<rootDir>/core/$1',
    '^@server(.*)$': '<rootDir>/server/$1',
  },
};
