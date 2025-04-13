// /// <reference types="vite/client" />
// declare module '*.vue' {
//   import { DefineComponent } from "vue";
//   const component: DefineComponent<object, object, any>
//   export default component
// }

/// <reference types="vite/client" />

// 支援 .vue 模組
declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<object, object, any>
  export default component
}

// 支援 three 的 OBJLoader 與 MTLLoader
declare module 'three/examples/jsm/loaders/OBJLoader.js' {
  import { Loader } from 'three'
  import { Group } from 'three'
  export class OBJLoader extends Loader {
    load(url: string, onLoad: (group: Group) => void): void
  }
}

declare module 'three/examples/jsm/loaders/MTLLoader.js' {
  import { Loader } from 'three'
  import { MaterialCreator } from 'three'
  export class MTLLoader extends Loader {
    load(url: string, onLoad: (materials: MaterialCreator) => void): void
  }

  export class MaterialCreator {
    preload(): void
  }
}

