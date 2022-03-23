export function createVnode(rootCompontent: object, props?: any, children?: any,) {
  const vnode = {
    type: rootCompontent, 
    props,
    children
  }
  return vnode
}