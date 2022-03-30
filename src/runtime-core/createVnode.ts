import { ShapeFlags } from "../shared/shapeFlags"
import { isObject } from "../shared/utils"
import { props, children, vnode } from "../../types/base"

export const Fragment = Symbol('Fragment')
export const Text = Symbol('Text')

export function createVnode(rootCompontent: object | string | symbol, props?: props, children?: children,) {
  const vnode: vnode = {
    type: rootCompontent,
    props,
    children,
    $el: undefined,
    key: props?.key,
    shapeFlag: getShapeFlags(rootCompontent)
  }

  if (typeof children === "string") {
    vnode.shapeFlag! |= ShapeFlags.STRING_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag! |= ShapeFlags.ARRAY_CHILDREN
  }
  
  if (vnode.shapeFlag! & ShapeFlags.STATEFUL_COMPONENT) {
    if (isObject(children)) {
      vnode.shapeFlag! |= ShapeFlags.SLOT_CHILDREN
    }
  }

  return vnode
}

function getShapeFlags(rootCompontent: object | string | symbol) {
  if (typeof rootCompontent === 'string') {
    return ShapeFlags.ELEMENT
  } else if (isObject(rootCompontent)) {
    return ShapeFlags.STATEFUL_COMPONENT
  }
}


export function createTextVNode(text: string) {
  return createVnode(Text, {} , text)
}