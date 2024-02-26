/*
  These rules should **not** conflict with prettier, such as spaces and new lines
  rules. Please refrain from doing rules for it, or you will encounter issues.
  (Unless you sure about what you're doing)
*/

module.exports = {
  root: true,
  env: { node: true },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: ['plugin:security/recommended-legacy', 'prettier'],
  overrides: [
    {
      files: ['./src/**/*.ts', './__tests__/**/*.ts'],
      parserOptions: {
        ecmaVersion: '2020',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
        project: './tsconfig.json'
      },
      rules: {
        // Javascript
        'array-callback-return': [2, { checkForEach: false, allowVoid: true }],
        'constructor-super': 2,
        // 'default-param-last': 2, // Uncomment if not working with typescript
        'for-direction': 2,
        'getter-return': 2,
        'no-async-promise-executor': 2,
        'no-await-in-loop': 2,
        'no-class-assign': 2,
        'no-compare-neg-zero': 2,
        'no-cond-assign': [2, 'always'],
        'no-const-assign': 2,
        'no-constant-binary-expression': 2,
        'no-constant-condition': 2,
        'no-constructor-return': 2,
        'no-control-regex': 2,
        'no-debugger': 2,
        'no-dupe-args': 2,
        'no-dupe-class-members': 2,
        'no-dupe-else-if': 2,
        'no-dupe-keys': 2,
        'no-duplicate-case': 2,
        'no-duplicate-imports': [2, { includeExports: true }],
        'no-empty-character-class': 2,
        'no-empty-pattern': 2,
        'no-ex-assign': 2,
        'no-fallthrough': 2,
        'no-inner-declarations': 2,
        'no-invalid-regexp': 2,
        'no-irregular-whitespace': 2,
        // 'no-loop-func': 2, // Uncomment if not working with typescript
        // 'no-loss-of-precision': 2, // Uncomment if not working with typescript
        'no-misleading-character-class': 2,
        'no-new-native-nonconstructor': 2,
        'no-promise-executor-return': [2, { allowVoid: true }],
        'no-prototype-builtins': 2,
        'no-self-assign': 2,
        'no-self-compare': 2,
        'no-setter-return': 2,
        'no-sparse-arrays': 2,
        'no-template-curly-in-string': 2,
        'no-undef': 2,
        'no-unexpected-multiline': 2,
        'no-unmodified-loop-condition': 2,
        // 'no-useless-constructor': 2, // Uncomment if not working with typescript
        'no-unreachable-loop': 2,
        'no-unsafe-finally': 2,
        'no-unsafe-optional-chaining': 2,
        'no-unused-private-class-members': 2,
        // const functions are considered variables by this rule, hence the need
        // variables false option
        // 'no-use-before-define': [2, { functions: false, variables: false }], // Uncomment if not working with typescript
        'no-useless-backreference': 2,
        'require-atomic-updates': 2,
        'use-isnan': 2,
        'valid-typeof': 2,
        'accessor-pairs': 2,
        // Stylistic choice, I highly recommend it, but feel free to change it
        'arrow-body-style': [2, 'always'],
        // If you use var, use it right, with let and const this rule is redundant
        'block-scoped-var': 2,
        'default-case-last': 2,
        eqeqeq: [2, 'smart'],
        'max-classes-per-file': [2, 1],
        // I present it only as a warning and not an error since sometimes (very
        //rarely it can't be avoided)
        'max-depth': [1, 4],
        'no-delete-var': 2,
        'no-empty': 2,
        // 'no-empty-function': 2, // Uncomment if not working with typescript
        'no-empty-static-block': 2,
        'no-eval': 2,
        'no-extra-boolean-cast': 2,
        'no-invalid-this': 2,
        'no-iterator': 2,
        'no-labels': 2,
        'no-nonoctal-decimal-escape': 2,
        'no-octal': 2,
        'no-proto': 2,
        // 'no-redeclare': 2, // Uncomment if not working with typescript
        'no-regex-spaces': 2,
        'no-return-assign': [2, 'always'],
        'no-script-url': 2,
        'no-shadow-restricted-names': 2,
        // 'no-throw-literal': 2, // Uncomment if not working with typescript
        'no-unneeded-ternary': 2,
        'no-unused-labels': 2,
        'no-useless-catch': 2,
        'no-useless-escape': 2,
        'no-var': 2,
        'no-with': 2,
        'prefer-const': 2,
        'prefer-promise-reject-errors': 2,
        // 'require-await': 2, // Uncomment if not working with typescript
        'require-yield': 2,

        // Typescript related
        '@typescript-eslint/adjacent-overload-signatures': 2,
        '@typescript-eslint/array-type': [2, { default: 'array' }],
        '@typescript-eslint/await-thenable': 2,
        '@typescript-eslint/ban-ts-comment': 2,
        '@typescript-eslint/consistent-generic-constructors': [
          2,
          'constructor'
        ],
        '@typescript-eslint/consistent-indexed-object-style': [
          2,
          'index-signature'
        ],
        '@typescript-eslint/consistent-type-assertions': [
          2,
          {
            assertionStyle: 'as',
            objectLiteralTypeAssertions: 'never'
          }
        ],
        '@typescript-eslint/consistent-type-definitions': [2, 'type'],
        '@typescript-eslint/consistent-type-exports': [
          2,
          { fixMixedExportsWithInlineTypeSpecifier: true }
        ],
        '@typescript-eslint/consistent-type-imports': [
          2,
          { prefer: 'type-imports', fixStyle: 'inline-type-imports' }
        ],
        '@typescript-eslint/explicit-member-accessibility': [
          2,
          { accessibility: 'explicit' }
        ],
        '@typescript-eslint/method-signature-style': [2, 'property'],
        '@typescript-eslint/no-base-to-string': 2,
        '@typescript-eslint/no-confusing-non-null-assertion': 2,
        // I prefer this style over the other option
        '@typescript-eslint/no-confusing-void-expression': 0,
        '@typescript-eslint/no-duplicate-enum-values': 2,
        '@typescript-eslint/no-duplicate-type-constituents': 2,
        '@typescript-eslint/no-dynamic-delete': 2,
        '@typescript-eslint/no-explicit-any': [2, { fixToUnknown: true }],
        '@typescript-eslint/no-extra-non-null-assertion': 2,
        '@typescript-eslint/no-floating-promises': [2, { ignoreIIFE: true }],
        '@typescript-eslint/no-for-in-array': 2,
        '@typescript-eslint/no-invalid-void-type': 2,
        '@typescript-eslint/no-import-type-side-effects': 2,
        '@typescript-eslint/no-inferrable-types': 2,
        '@typescript-eslint/no-meaningless-void-operator': [
          2,
          { checkNever: false }
        ],
        '@typescript-eslint/no-misused-new': 2,
        '@typescript-eslint/no-misused-promises': [
          2,
          { checksVoidReturn: false }
        ],
        '@typescript-eslint/no-namespace': 2,
        '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 2,
        '@typescript-eslint/no-non-null-asserted-optional-chain': 2,
        '@typescript-eslint/no-redundant-type-constituents': 2,
        '@typescript-eslint/no-require-imports': 2,
        '@typescript-eslint/no-unnecessary-boolean-literal-compare': 2,
        '@typescript-eslint/no-unnecessary-condition': 2,
        '@typescript-eslint/no-unnecessary-type-constraint': 2,
        '@typescript-eslint/no-unsafe-unary-minus': 2,
        '@typescript-eslint/no-useless-empty-export': 2,
        '@typescript-eslint/no-useless-template-literals': 2,
        '@typescript-eslint/no-var-requires': 2,
        '@typescript-eslint/non-nullable-type-assertion-style': 2,
        '@typescript-eslint/prefer-as-const': 2,
        '@typescript-eslint/prefer-enum-initializers': 2,
        '@typescript-eslint/prefer-for-of': 2,
        '@typescript-eslint/prefer-function-type': 2,
        '@typescript-eslint/prefer-nullish-coalescing': 2,
        '@typescript-eslint/prefer-optional-chain': 2,
        '@typescript-eslint/prefer-readonly': 2,
        '@typescript-eslint/prefer-reduce-type-parameter': 2,
        '@typescript-eslint/prefer-return-this-type': 2,
        '@typescript-eslint/promise-function-async': 2,
        '@typescript-eslint/require-array-sort-compare': 2,
        '@typescript-eslint/restrict-plus-operands': 2,
        '@typescript-eslint/sort-type-constituents': 2,
        '@typescript-eslint/switch-exhaustiveness-check': 2,

        // Typescript overrides
        'default-param-last': 'off',
        '@typescript-eslint/default-param-last': 2,

        'max-params': 'off',
        '@typescript-eslint/max-params': [2, { max: 3 }],

        'no-array-constructor': 'off',
        '@typescript-eslint/no-array-constructor': 2,

        'no-empty-function': 'off',
        '@typescript-eslint/no-empty-function': [
          2,
          { allow: ['private-constructors'] }
        ],

        'no-implied-eval': 'off',
        '@typescript-eslint/no-implied-eval': 2,

        'no-loop-func': 'off',
        '@typescript-eslint/no-loop-func': 2,

        'no-loss-of-precision': 'off',
        '@typescript-eslint/no-loss-of-precision': 2,

        'no-throw-literal': 'off',
        '@typescript-eslint/no-throw-literal': 2,

        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': 2,

        'no-unused-expressions': 'off',
        '@typescript-eslint/no-unused-expressions': 2,

        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [2, { ignoreRestSiblings: true }],

        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
          2,
          { functions: false, variables: false }
        ],

        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 2,

        'require-await': 'off',
        '@typescript-eslint/require-await': 2,

        'no-return-await': 'off',
        '@typescript-eslint/return-await': [2, 'always'],

        // Security related
        'security/detect-bidi-characters': 2,
        'security/detect-buffer-noassert': 2,
        'security/detect-child-process': 2,
        'security/detect-disable-mustache-escape': 2,
        'security/detect-eval-with-expression': 2,
        'security/detect-new-buffer': 2,
        'security/detect-no-csrf-before-method-override': 2,
        'security/detect-non-literal-fs-filename': 2,
        'security/detect-non-literal-regexp': 2,
        'security/detect-non-literal-require': 2,
        // Note: The reason this rule is turned off is because
        // it marks every [] brackets with dynamic index as error.
        // Therefore it is disabled, HOWEVER make sure you DO NOT
        // iterate over object with user input value because it is
        // a major security issue.
        'security/detect-object-injection': 0,
        'security/detect-possible-timing-attacks': 2,
        'security/detect-pseudoRandomBytes': 2,
        'security/detect-unsafe-regex': 2
      }
    }
  ]
};
