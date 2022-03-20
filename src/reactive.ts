import { track, trigger } from '../src/effect'
import { multipleHandler, readonlyHandler } from './baseHandler'


export function reactive(row: Obj) {
  return createActiveObject(row, multipleHandler)
}

export function readOnly(row: Obj) {
  return createActiveObject(row, readonlyHandler)
}

function createActiveObject(row: Obj, handler: ProxyHandler<Obj>) {
  return new Proxy(row, handler)
}

