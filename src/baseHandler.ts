// 重构优化

import { track, trigger } from "./effect"

// 抽离get, set
function createGetter(isReadOnly: boolean = false) {
  return function get(org: Obj, key: keyof Obj) {
    const result  = Reflect.get(org, key)
    if (!isReadOnly) {
      track(org, key)
    }
    return result
  }
}

function createSet() {
  return function (org: Obj, key: keyof Obj, value: any) {
    const reuslt = Reflect.set(org, key, value)
    trigger(org, key)
    return reuslt
  }
}

const getter = createGetter()
const setter = createSet()
const readOnlyGetter = createGetter(true)

export const multipleHandler = {
  get: getter,
  set: setter
}

export const readonlyHandler = {
  get: readOnlyGetter,
  set: function (org: Obj, key: keyof Obj, value: any) {
    console.warn(`readonly --> no set!`, org)
    return true
  }
}

export default {
  multipleHandler,
  readonlyHandler,
}