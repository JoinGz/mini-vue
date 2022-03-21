import { Obj } from "../types/base"
import { isTracking, trackEffect, triggerEffects } from "./effect"
import { reactive } from "./reactive"
import { hasChanged, isObject } from "./shared/utils"

type refImp = string | number | Obj


// todo: ts 优化
class RefImpl<T> {
  private _value
  deps: Set<any>

  constructor(value: T) {
    this._value = convert(value)
    this.deps = new Set()
  }

  get value() {
    const result = this._value
    trackRefValue(this.deps)
    return result as T
  }

  set value(newValue) {
    if (hasChanged(this._value, newValue)) {
      this._value = newValue
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