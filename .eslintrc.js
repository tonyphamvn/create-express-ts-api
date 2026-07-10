module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  extends: ['airbnb-base', 'plugin:prettier/recommended', 'plugin:import/typescript'],
  plugins: ['no-only-tests'],
  settings: {
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    'max-len': 0, // specify the maximum length of a line in your program (off by default)
    'no-eval': 0, // disallow use of eval()
    'no-unused-vars': [
      'warn',
      {
        vars: 'local',
        args: 'none',
        ignoreRestSiblings: true,
      },
    ], // disallow declaration of variables that are not used in the code
    radix: 0, // require use of the second argument for parseInt() (off by default)
    'class-methods-use-this': 0,
    'consistent-return': 0, // require return statements to either always or never specify values
    'linebreak-style': 0,
    'prefer-template': 0,
    'no-underscore-dangle': 0,
    'max-classes-per-file': 0,
    'quote-props': 0,
    'dot-notation': 0,
    'object-shorthand': 0,
    'no-param-reassign': 0,
    camelcase: 0,
    'default-case': 0,
    'no-use-before-define': 0,
    'arrow-body-style': 0,
    'func-names': 0,
    'import/newline-after-import': 0,
    'padded-blocks': 0,
    'no-only-tests/no-only-tests': 2, // disallow tests with `.only`
    'no-unneeded-ternary': 0,
    'no-restricted-syntax': 0,
    'no-await-in-loop': 0,
    'import/extensions': 0,
    'import/first': 0,
    'no-else-return': 0,
    'no-console': 0,
    'default-param-last': 0,
    'no-useless-constructor': 0,
    'no-empty-function': 0,
    'no-useless-escape': 0,
    'import/prefer-default-export': 0,
    strict: 0,
    'import/export': 0,
    'lines-between-class-members': ['error', 'always', { exceptAfterSingleLine: true }],
    'import/order': ['error'],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: ['gulpfile.babel.js', 'server/tests/**/*.ts'],
      },
    ],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
      },
      { usePrettierrc: true },
    ],
  },
};
