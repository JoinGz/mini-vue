import { Obj, ReactiveFlags } from '../../types/base'
import { multipleHandler, readonlyHandler, shallowReadonlyHandler } from './baseHandler'

export const reactiveMap = new WeakMap()
export const readOnlyMap = new WeakMap()
export const shallowReadOnlyMap = new WeakMap()

export function reactive<T extends object>(row: T): T {
  return createActiveObject(row, multipleHandler, reactiveMap) as T
}

export function readOnly<T extends object>(row: T): T {
  return createActiveObject(row, readonlyHandler, readOnlyMap) as T
}

function createActiveObject<T extends object>(row: T, handler: ProxyHandler<Obj>, proxyWeakMap: WeakMap<any, any>) {
  const exitProxy = proxyWeakMap.get(row)
  if (exitProxy) return exitProxy
  const proxyObj = new Proxy(row, handler)
  proxyWeakMap.set(row, proxyObj)
  return proxyObj
}

export function isReactive(row: Obj) {
  return !!(row && row[ReactiveFlags.IS_REACTIVE])
}
export function isReadOnly(row: Obj) {
  return !!row[ReactiveFlags.IS_READONLY]
}

export function isProxy(row: Obj) {
  return isReactive(row) || isReadOnly(row)
}

export function shallowReadOnly<T extends object>(row: T): T {
  return createActiveObject(row, shallowReadonlyHandler, shallowReadOnlyMap) as T
}

export function toRaw<T>(obj: T): T {
  const rowObj = obj && (obj as any)[ReactiveFlags['__v_row']]
  return rowObj ? toRaw(rowObj) : obj
}