import { Obj } from '../../types/base'
import { effect } from './effect'

type watchOptions = {
  immediate: boolean
}

type watchAim = Obj | ((...arg: any[]) => any)
type anyFunction = (...arg: any[]) => any;

export function watch(source: watchAim, cb: () => any, options?: watchOptions) {
  return doWatch(source, cb, options)
}

function doWatch(
  source: watchAim,
  cb: () => any,
  options?: watchOptions
) {
  let getter: anyFunction;
  if (typeof source === 'function') {
    getter = source as anyFunction;
  } else if (typeof source === 'object' && source) {
    getter = () => getAllKey(source)
  } else {
    console.warn(`不支持的入参，请传入响应式对象或函数`)
    return;
  }
  const result = effect(getter!, {
    scheduler: cb,
  })
  if (options?.immediate) {
    cb()
  }
  return result
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
