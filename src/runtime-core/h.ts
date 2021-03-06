import { children, props } from "../../types/base";
import { createVnode } from "./createVnode";

export function h(rootCompontent: object | string | symbol, props?: props, children?: children,) {
  return createVnode(rootCompontent, props, children)
}

export { createVnode as createElementVNode }