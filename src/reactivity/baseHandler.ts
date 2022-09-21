// 重构优化

import { track, trigger } from "./effect"
import { ReactiveFlags } from '../../types/base'
import { reactive, reactiveMap, readOnly, readOnlyMap, shallowReadOnlyMap, toRow } from "./reactive"
import { isObject } from "../shared/utils"

// 抽离get, set
function createGetter(isReadOnly: boolean = false, options: {shallowReadOnly?: boolean} = {}) {
  return function get<T extends object>(org: T, key: keyof T, receiver: T) {

    if (key === ReactiveFlags['IS_REACTIVE']) {
      return !isReadOnly
    } else if (key === ReactiveFlags['IS_READONLY']) {
      return isReadOnly
    } else if (key === ReactiveFlags['__v_row']) {
      if (receiver === (isReadOnly ? (options.shallowReadOnly ? shallowReadOnlyMap : readOnlyMap) : reactiveMap).get(org)) {
        return org
      }
    }

    const result = Reflect.get(org, key)

    // 如果是shallowReadOnly就可以
    if (options.shallowReadOnly) {
      return result
    }
    
    if (!isReadOnly) {
      track(org, key)
    }

    if (isObject(result)) {
      return isReadOnly ? readOnly(result) : reactive(result)
    }
    

    return result
  }
}

function createSet() {
  return function <T extends object>(org: T, key: keyof T, value: any) {
    const reuslt = Reflect.set(org, key, toRow(value))
    trigger(org, key)
    return reuslt
  }
}

const getter = createGetter()
const setter = createSet()
const readOnlyGetter = createGetter(true)
const shallowReadOnlyGetter = createGetter(true, {shallowReadOnly: true})

export const multipleHandler: ProxyHandler<object> = {
  get: getter,
  set: setter,
  has
}

export const readonlyHandler: ProxyHandler<object> = {
  get: readOnlyGetter,
  set: function <T extends object>(org: T, key: keyof T, value: any) {
    console.warn(`readonly --> no set!`, org)
    return true
  }
}

export const shallowReadonlyHandler: ProxyHandler<object> = Object.assign({}, readonlyHandler, {
  get: shallowReadOnlyGetter
})

function has(target: object, key: PropertyKey)  {
  track(target, key)
  return Reflect.has(target, key)
}