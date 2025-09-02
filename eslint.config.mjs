// eslint.config.mjs
import js from '@eslint/js';
import next from '@next/eslint-plugin-next';
import tseslint from 'typescript-eslint';

const core = next.configs['core-web-vitals'] ?? {};

export default [
  // Ignore build/vendor and your archive
  { ignores: ['.next/**', 'node_modules/**', '_archive/**'] },

  // Base JS + TS recommended (these ARE arrays, so spread is correct)
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Next.js Core Web Vitals — it's a SINGLE object; only take its rules
  {
    plugins: { '@next/next': next },
    rules: {
      ...(core.rules ?? {}),
      // project tweaks
      'no-unused-vars': 'off',
    },
  },
];
