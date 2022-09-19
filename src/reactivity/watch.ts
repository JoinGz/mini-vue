import { Obj } from '../../types/base'
import { effect } from './effect'


export function watch(obj: Obj, fn: () => any) {
  return doWatch(obj, fn)
}

function doWatch(
  obj: Obj,
  fn: () => any,
) {
  return effect(() => getAllKey(obj), {
    scheduler: fn,
  })
}

function getAllKey(obj: Obj, set = new Set()) {
  if (set.has(obj) || (typeof obj !== 'object' && obj)) {
    return obj
  }
  set.add(obj)
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
        getAllKey(obj[key], set)
    }
  }
}
