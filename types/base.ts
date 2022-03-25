export type Obj = { [key: string | number | symbol]: any }

export enum ReactiveFlags {
  "IS_REACTIVE" = "__v_isReactive",
  "IS_READONLY" = "__v_isReadonly"
}

export type props = Obj & { id: string, class: string[] | string }

export type children = vnode[] |  string

export type vnode = {
  type: Obj | string,
  props?: props,
  children?: children,
  $el?: Element,
  shapeFlag?: number,
  render?: () => vnode,
  setup?: () => vnode
} 

export type instance = {
  vnode: vnode,
  type: vnode,
  render?: () => vnode,
  setupState: Obj,
  $el?: Element,
  proxy?: any
}