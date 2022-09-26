import { Obj, ReactiveFlags } from "../../types/base"
import { triggerType } from "../reactivity/baseHandler"
import { pauseTracking, resetTracking, track, trigger } from "../reactivity/effect"
import { reactive, toRaw } from "../reactivity/reactive"

export function isObject(obj: any) {
  return obj !== null && typeof obj === 'object'
}

export function hasChanged(value: any, newValue: any) {
  return !Object.is(value, newValue)
}

export function hasOwn(obj: object, key: string| number | symbol)  {
  return Object.prototype.hasOwnProperty.call(obj, key)
} 

export function toHandlerKey(fnName: string) {
  return fnName ? 'on' + capitalize(fnName) : "" 
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export const camelize = (str: string) => {
  return str.replace(/-([\w])/g, (_: string, first: string) => {
    return first.toUpperCase()
  })
}

export function isArray(value: any): value is Array<any>{
  return Array.isArray(value)
}
export function isMap(value: any): value is Map<any, any>{
  return Object.prototype.toString.call(value) === '[object Map]'
}
export function isSet(value: any): value is Set<any>{
  return Object.prototype.toString.call(value) === '[object Set]'
}

export function createArrayInstrumentations() {
  const arrayInstrumentations: Obj = {}
    ; (['includes', 'indexOf', 'lastIndexOf'] as const).forEach((fnName) => {
      const originFn = Array.prototype[fnName] as any
      arrayInstrumentations[fnName] = function (...arg: any[]) {
        let res = originFn.apply(this, arg)

        if (res === false || res === -1) {
          res = originFn.apply(this[ReactiveFlags['__v_row']], arg)
        }

        return res
      }
    })
    ; (['push', 'pop', 'shift', 'unshift', 'splice'] as const).forEach((fnName) => {
      const originFn = Array.prototype[fnName] as any
      arrayInstrumentations[fnName] = function (...arg: any[]) {
        pauseTracking()
        let res = originFn.apply(this, arg)
        resetTracking()
        return res
      }
    })
  return arrayInstrumentations
}

export function createMapInstrumentations() {
  const mapInstrumentations:Obj = {};
  ; (['set'] as const).forEach((fnName) => {

    mapInstrumentations[fnName] = function (...arg: any[]) {
      let row = this[ReactiveFlags['__v_row']]

      let key = arg[0]
      let newValue = toRaw(arg[1])

      const had = row.has(key)

      let oldValue = toRaw(row.get(key));

      let res = row[fnName](key, newValue)

      if (hasChanged(oldValue, newValue)) {
        trigger(row, key, had ? triggerType.SET : triggerType.ADD)
      }

      return res
    }
  })
  mapInstrumentations['get'] = function (...arg: any) {
    let row = this[ReactiveFlags['__v_row']]
    let key = arg[0]
    const had = row.has(key)
    track(row, key)
    if (had) {
      let res = row['get'](...arg)
      return isObject(res) ? reactive(res) : res
    }
  }
  mapInstrumentations['add'] = function (...arg: any) {
    let row = this[ReactiveFlags['__v_row']]
    let key = arg[0]
    const has = row.has(key)
    let res = row['add'](...arg)


    if (!has) {
      trigger(row, key, triggerType.ADD)
    }


    return  res
  }

  mapInstrumentations['delete'] = function (...arg: any) {
    let row = this[ReactiveFlags['__v_row']]
    let key = arg[0]
    const has = row.has(key)
    let res = row['delete'](...arg)


    if (has && res) {
      trigger(row, key, triggerType.DELETED)
    }
    return  res
  }

  return mapInstrumentations
}

export const EMPTY_OBJ = {}