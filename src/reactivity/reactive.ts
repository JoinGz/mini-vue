import { Obj, ReactiveFlags } from '../../types/base'
import { multipleHandler, readonlyHandler, shallowReadonlyHandler } from './baseHandler'

export function reactive<T extends object>(row: T): T {
  return createActiveObject(row, multipleHandler) as T
}

export function readOnly<T extends object>(row: T): T {
  return createActiveObject(row, readonlyHandler) as T
}

function createActiveObject<T extends object>(row: T, handler: ProxyHandler<Obj>) {
  return new Proxy(row, handler)
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
  return createActiveObject(row, shallowReadonlyHandler) as T
}
