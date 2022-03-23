import { createVnode } from './createVnode'
import { render } from './renderer'

export function createApp<T extends object>(rootCompontent: T) {
  return {
    mount: (dom: any) => {
      const vnode = createVnode(rootCompontent)

      render(vnode, dom)
    },
  }
}









