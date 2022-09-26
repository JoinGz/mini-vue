// 重构优化

import { track, trigger } from "./effect"
import { ReactiveFlags } from '../../types/base'
import { reactive, reactiveMap, readOnly, readOnlyMap, shallowReadOnlyMap,  toRaw } from "./reactive"
import { createArrayInstrumentations, createMapInstrumentations, hasChanged, isArray, isMap, isObject, isSet } from "../shared/utils"
export const iterate_key = Symbol()

export const enum  triggerType {
  'ADD',
  'DELETED',
  'SET'
}



const arrayInstrumentations = createArrayInstrumentations()

const mapInstrumentations = createMapInstrumentations()

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

    if (isArray(org) && arrayInstrumentations.hasOwnProperty(key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }
    if (isMap(org) || isSet(org)) {
      if (key === 'size') {
        track(org, iterate_key)
        return Reflect.get(org, key, org)
      }
      if (mapInstrumentations.hasOwnProperty(key)) {
        return Reflect.get(mapInstrumentations, key, receiver)
      }
      return Reflect.get(org, key).bind(org)
    }


    // 如果是shallowReadOnly就可以
    if (options.shallowReadOnly) {
      return result
    }
    
    if (!isReadOnly && typeof key !== 'symbol') {
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
    const rawValue = toRaw(value)
    let label: triggerType = triggerType.ADD;
    if (org.hasOwnProperty(key)) {
      label = triggerType.SET
    }
    if (Array.isArray(org)) {
      const overLength = Number(key) >= org.length
      label = overLength ? triggerType.ADD : triggerType.SET
    }
    const oldValue = org[key]
    const reuslt = Reflect.set(org, key, rawValue)
    if (hasChanged(oldValue, value)) {
      trigger(org, key, label, value)
    }
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
  has,
  ownKeys,
  deleteProperty
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

function ownKeys(target: object) {
  track(target, Array.isArray(target) ? "length" : iterate_key)
  return Reflect.ownKeys(target)
}

function deleteProperty(target: object, key: PropertyKey) {

    // 检查被操作的属性是否是对象自己的属性
    const hadKey = Object.prototype.hasOwnProperty.call(target, key)
    // 使用 Reflect.deleteProperty 完成属性的删除
    const res = Reflect.deleteProperty(target, key)

    if (res && hadKey) {
      // 只有当被删除的属性是对象自己的属性并且成功删除时，才触发更新
      trigger(target, key, triggerType.DELETED)
    }

    return res

}
