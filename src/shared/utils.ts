import { Obj, ReactiveFlags } from "../../types/base"
import { pauseTracking, resetTracking } from "../reactivity/effect"

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

export const EMPTY_OBJ = {}