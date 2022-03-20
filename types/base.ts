export type Obj = { [key: string | number | symbol]: any }

export enum ReactiveFlags {
  "IS_REACTIVE" = "__v_isReactive",
  "IS_READONLY" = "__v_isReadonly"
}