import { anyFunction } from "../src/reactivity/watch"

export type Obj = { [key: string | number | symbol]: any }

export enum ReactiveFlags {
  "IS_REACTIVE" = "__v_isReactive",
  "IS_READONLY" = "__v_isReadonly",
  "__v_row" = "__v_row",
}

export type props = Obj & { id?: string, class?: string[] | string }

export type children = vnode[] |  string

export type vnode = {
  type: Obj | string | symbol,
  props?: props,
  children?: children,
  $el?: HTMLElement | Text,
  shapeFlag?: number,
  render?: () => vnode,
  setup?: (...arg: any[]) => vnode,
  key: number | string,
  component?: instance,
  template?: string,
  keepAliveCtx?: Obj | null,
  transtionOps?: Obj
} 

export type instance = {
  vnode: vnode,
  type: Obj | string | symbol | anyFunction,
  props?: Obj, // 这种后面一定会增加的属性咋个定义呢？目前是定义可选
  render?: (...arg: any[]) => vnode,
  setupState: Obj,
  $el?: HTMLElement,
  $slot?: any,
  proxy?: any,
  emit?: (...arg: any[]) => any,
  parent: instance | null,
  provide: Obj,
  subTree?: vnode,
  isMounted: boolean,
  update?: ()=>any
  next?: vnode | null,
  mounted: anyFunction[]
}

export type parentInstance = instance | null 