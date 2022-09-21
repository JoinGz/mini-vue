// 重构优化

import { track, trigger } from "./effect"
import { ReactiveFlags } from '../../types/base'
import { reactive, reactiveMap, readOnly, readOnlyMap, shallowReadOnlyMap, toRow } from "./reactive"
import { isObject } from "../shared/utils"
export const iterate_key = Symbol()

export const enum  triggerType {
  'ADD',
  'DELETED'
}

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
    let label: triggerType | undefined = triggerType.ADD;
    if (org.hasOwnProperty(key)) {
      label = undefined
    }
    const reuslt = Reflect.set(org, key, toRow(value))
    trigger(org, key, label)
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
  track(target, iterate_key)
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