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
  setup?: (...arg: any[]) => vnode
} 

export type instance = {
  vnode: vnode,
  type: vnode,
  props?: object, // 这种后面一定会增加的属性咋个定义呢？目前是定义可选
  render?: () => vnode,
  setupState: Obj,
  $el?: Element,
  proxy?: any
}