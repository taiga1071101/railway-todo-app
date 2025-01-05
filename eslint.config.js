// import globals, { browser } from 'globals';
import pluginJs from '@eslint/js';
import pluginReact from 'eslint-plugin-react';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,jsx}'] },
  {
    languageOptions: {
      globals: {
        //globals.browser
        browser: true,
        node: true,
        jest: true,
        console: true,
        document: true,
        process: true, //
        test: true, // test環境で使用されるグローバル変数。これをESLintに認識されることで、余計なエラーを解消させる
        expect: true,
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: 'detect', // Reactのバージョンを自動検出
      },
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // React 17以降ではスコープにReactをインポートしなくてもOK
    },
  },
  // Prettierの設定を適用してESLintルールを無効化
  {
    plugins: ['prettier'],
    extends: ['prettier'],
    rules: {
      'prettier/prettier': 'warn', // Prettierのフォーマットに従わない場合、警告を表示
    },
  },
];
