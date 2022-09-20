import { Obj } from '../../types/base'
import { ReactiveEffect } from './effect'

type watchOptions = {
  immediate: boolean
}

type watchAim = Obj | ((...arg: any[]) => any)
type anyFunction = (...arg: any[]) => any

export function watch(
  source: watchAim,
  cb: anyFunction,
  options?: watchOptions
) {
  return doWatch(source, cb, options)
}

function doWatch(source: watchAim, cb: anyFunction, options?: watchOptions) {
  let getter: anyFunction
  if (typeof source === 'function') {
    getter = source as anyFunction
  } else if (typeof source === 'object' && source) {
    getter = () => getAllKey(source)
  } else {
    console.warn(`不支持的入参，请传入响应式对象或函数`)
    return
  }
  let oldValue: any, newValue: any;
  let cleanup:anyFunction;
  const onInvalidate = (fn: anyFunction)=>cleanup = fn
  const job = () => {
    newValue = result.run()
    if (cleanup)cleanup()
    cb(oldValue, newValue, onInvalidate)
    oldValue = newValue
  }
  const result = new ReactiveEffect(getter, {
    scheduler: job,
  })
  if (options?.immediate) {
    job()
  }
  return (oldValue = result.run())
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
  return obj
}
