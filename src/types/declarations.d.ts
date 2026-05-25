/// <reference types="react" />

import React from 'react';

declare global {
  namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}

// CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Side-effect CSS imports
declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

// Vite environment variables
interface ImportMetaEnv {
  readonly VITE_TENCENT_MAP_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}