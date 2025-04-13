declare module 'three/examples/jsm/loaders/OBJLoader.js' {
  import { Loader, Group } from 'three'
  export class OBJLoader extends Loader {
    load(url: string, onLoad: (group: Group) => void): void
  }
}

declare module 'three/examples/jsm/loaders/MTLLoader.js' {
  import { Loader } from 'three'
  export class MTLLoader extends Loader {
    load(url: string, onLoad: (materials: any) => void): void
  }
}


