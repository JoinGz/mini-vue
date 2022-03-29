import { createVnode } from './createVnode'

export function createAppAPI(render: (...arg: any[]) => any) {

  return function createApp<T extends object>(rootCompontent: T) {
    return {
      mount: (dom: HTMLElement) => {
        const vnode = createVnode(rootCompontent)
  
        render(vnode, dom)
      },
    }
  }
}










