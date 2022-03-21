import { Obj } from "../types/base"
import { isTracking, trackEffect, triggerEffects } from "./effect"
import { reactive } from "./reactive"
import { hasChanged, isObject } from "./shared/utils"

type refImp = string | number | Obj


// todo: ts 优化
class RefImpl<T> {
  private _value
  deps: Set<any>
  public __v_isRef =  true
  private _rowValue: T

  constructor(value: T) {
    // 保存原始值，因为对象会对proxy，当时候就对不不准
    this._rowValue = value
    this._value = convert(value)
    this.deps = new Set()
  }

  get value() {
    const result = this._value
    trackRefValue(this.deps)
    return result as T
  }

  set value(newValue) {
    if (hasChanged(this._rowValue, newValue)) {
      this._rowValue = newValue
      this._value = convert(newValue)
      triggerEffects(this.deps)
    }
  }
}

function convert(row: Obj) {
  return isObject(row) ? reactive(row) : row
}

export function ref<T>(simple: T) {
  return new RefImpl<T>(simple)
}

function trackRefValue(deps: Set<any>) {
  if (isTracking()) {
    trackEffect(deps)
  }
}

export function isRef(ref: any) {
  return !!ref["__v_isRef"]
}

export function unRef(ref: any) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRef_my(target: any) {
  return new Proxy(target, {
    get (target, key) {
      return unRef(target)[key]
    }
  })
}

export function proxyRef(target: any) {
  return new Proxy(target, {
    get (target, key) {
      return unRef(Reflect.get(target, key))
    },
    set (target, key, newValue) {
      const orgKey = Reflect.get(target, key)
      
      // 当原来是ref的时候每次都生成了新个的ref
      // if (isRef(orgKey)) {
      //   newValue = isRef(newValue) ? newValue : ref(newValue)
      //   return Reflect.set(target, key, newValue)
      // } else {
      //   return Reflect.set(target, key, newValue)
      // }

      // 其实只需要改变原来ref的值即可,对象依然保留
      if (isRef(orgKey) && !isRef(newValue)) {
        return (orgKey.value = newValue)
      } else {
        return Reflect.set(target, key, newValue)
      }
    }
  })
}