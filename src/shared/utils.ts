import { Obj, ReactiveFlags } from "../../types/base"
import { iterate_key, map_key_iterate_key, triggerType } from "../reactivity/baseHandler"
import { pauseTracking, resetTracking, track, trigger } from "../reactivity/effect"
import { reactive, toRaw } from "../reactivity/reactive"
import { anyFunction } from "../reactivity/watch"

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
  const mapInstrumentations: Obj = {};
  const warp = (v: any) => isObject(v) ? reactive(v) : v
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

  mapInstrumentations['forEach'] = function (cb: anyFunction, thisArg: any) {
    let row = this[ReactiveFlags['__v_row']]
    track(row, iterate_key)
    row.forEach((item: any, key:any) => {
      cb.call(thisArg, warp(item), warp(key), this)
    })

  }

  mapInstrumentations[Symbol.iterator] = mapInstrumentations['entries'] = iteratorMehtod

  // ts: 将this放在函数参数列表上声明类型即可，使用的时候this不会干扰形参传入顺序
  function iteratorMehtod(this: any) {
    const raw = this[ReactiveFlags['__v_row']]

    const res = Reflect.get(raw, Symbol.iterator, raw).bind(raw)()
    track(raw, iterate_key)
    return {
      next() {
        const { value, done } = res.next()
        return { value: value ? [warp(value[0]), warp(value[1])] : value, done }
      },
      [Symbol.iterator]() {
        return this
      }
    }
  }

  ;['values', 'keys'].forEach(fnName => {

    mapInstrumentations[fnName] = function () {
      const raw = this[ReactiveFlags['__v_row']]
      const res = Reflect.get(raw, fnName, raw).bind(raw)()
      track(raw, fnName === 'keys'? map_key_iterate_key : iterate_key)
      return {
        next() {
          const { value, done } = res.next()
          return { value: value ? warp(value) : value, done }
        },
        [Symbol.iterator]() {
          return this
        }
      }
      
  
    }
  })

  return mapInstrumentations
}

export const EMPTY_OBJ = {}


export function isFunction(val: any): val is Function {
  return typeof val === 'function'
}