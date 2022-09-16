import { effect } from './effect'

export function watch(obj: { [k in keyof any]: any }, fn: () => any) {
  return doWatch(obj, fn)
}

function doWatch(obj: { [k in keyof any]: any }, fn: () => any) {
  return effect(() => getAllKey(obj), {
    scheduler: fn,
  })
}

function getAllKey(obj: { [k in keyof any]: any }) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const item = obj[key]
      if (typeof item === 'object' && item) {
        getAllKey(item)
      }
    }
  }
}
