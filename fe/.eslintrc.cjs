module.exports = {
  root: true,
  parser: "vue-eslint-parser",
  overrides: [
    {
      files: [
        "./cypress.config.ts",
        "./vite.config.ts",
        "src/**/*.ts",
        "src/**/*.vue",
        "cypress/**/*.ts",
      ],
      extends: [
        "eslint:recommended",
        "plugin:vue/vue3-recommended",
        'plugin:security/recommended-legacy',
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:vue/essential",
        "@vue/eslint-config-typescript",
        "prettier",
      ],
      parserOptions: {
        parser: {
          ts: "@typescript-eslint/parser",
          "<template>": "espree",
        },
        tsconfigRootDir: __dirname,
        project: "./tsconfig.json",
        sourceType: "module",
      },
      rules: {
        "vue/multi-word-component-names": "off",
        "vue/no-v-html": "off",
        "vue/no-v-model-argument": "off",

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
        // TODO
        // I wish I could enable it, but it is way too much work to implement
        // (Maybe some day)
        // '@typescript-eslint/prefer-readonly': 2,
        '@typescript-eslint/prefer-reduce-type-parameter': 2,
        '@typescript-eslint/prefer-return-this-type': 2,
        '@typescript-eslint/promise-function-async': 2,
        '@typescript-eslint/require-array-sort-compare': 2,
        '@typescript-eslint/restrict-plus-operands': 2,
        '@typescript-eslint/sort-type-constituents': 2,
        '@typescript-eslint/switch-exhaustiveness-check': 2,

        'default-param-last': 'off',
        '@typescript-eslint/default-param-last': 2,

        'init-declarations': 'off',
        '@typescript-eslint/init-declarations': 2,

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

        'no-useless-constructor': 'off',
        '@typescript-eslint/no-useless-constructor': 2,

        'require-await': 'off',
        '@typescript-eslint/require-await': 2,

        'no-return-await': 'off',
        '@typescript-eslint/return-await': [2, 'always'],

        "security/detect-bidi-characters": "error",
        "security/detect-buffer-noassert": "error",
        "security/detect-child-process": "error",
        "security/detect-disable-mustache-escape": "error",
        "security/detect-eval-with-expression": "error",
        "security/detect-new-buffer": "error",
        "security/detect-no-csrf-before-method-override": "error",
        "security/detect-non-literal-fs-filename": "error",
        "security/detect-non-literal-regexp": "error",
        "security/detect-non-literal-require": "error",
        // Note: The reason this rule is turned off is because
        // it marks every [] brackets with dynamic index as error.
        // Therefore it is disabled, HOWEVER make sure you DO NOT
        // iterate over object with user input value because it is
        // a major security issue.
        "security/detect-object-injection": "off",
        "security/detect-possible-timing-attacks": "error",
        "security/detect-pseudoRandomBytes": "error",
        "security/detect-unsafe-regex": "error",
      },
    },
  ],
};