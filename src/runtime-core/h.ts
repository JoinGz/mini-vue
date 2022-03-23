import { createVnode } from "./createVnode";

export function h(rootCompontent: object, props?: any, children?: any,) {
  return createVnode(rootCompontent, props, children)
}