export { h, Fragment, isJsxElement, isComponent, createTemplate as template } from './jsxRenderer';

export { onMount, onDestroy, useInject, useProvide, useRef } from './hooks';

export type { InjectionKey } from './hooks';

export { renderToString, hydrate, ssg } from './server';

//@ts-ignore
export * from '../types/jsx.d.ts';
