import { ShapeFlags } from "../shared/shapeFlags"
import { isObject } from "../shared/utils"
import { props, children, vnode } from "../../types/base"

export function createVnode(rootCompontent: object, props?: props, children?: children,) {
  const vnode: vnode = {
    type: rootCompontent, 
    props,
    children,
    $el: new Element,
    shapeFlag: getShapeFlags(rootCompontent)
  }

  if (typeof children === "string") {
    vnode.shapeFlag! |= ShapeFlags.STRING_CHILDREN
  } else if (Array.isArray(children)) {
    vnode.shapeFlag! |= ShapeFlags.ARRAY_CHILDREN
  }

  return vnode
}

function getShapeFlags(rootCompontent: object) {
  if (typeof rootCompontent === 'string') {
    return ShapeFlags.ELEMENT
  } else if (isObject(rootCompontent)) {
    return ShapeFlags.STATEFUL_COMPONENT
  }
}
