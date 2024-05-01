import { transformJSX } from './jsx';
import { transformProgram } from './program';
import type { PluginObj } from '@babel/core';
export { Options, State } from './types';
export default function (): PluginObj {
  return {
    name: 'babel-plugin-essor',
    manipulateOptions({ filename }, parserOpts) {
      if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
        parserOpts.plugins.push('typescript');
      }
      parserOpts.plugins.push('jsx');
    },
    visitor: {
      Program: transformProgram,
      JSXElement: transformJSX,
      JSXFragment: transformJSX,
    },
  };
}
