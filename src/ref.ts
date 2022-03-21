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