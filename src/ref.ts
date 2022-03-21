import { isTracking, trackEffect, triggerEffects } from "./effect"
import { hasChanged } from "./shared/utils"

type refImp = string | number

class RefImpl<T> {
  private _value
  deps: Set<any>

  constructor(value: T) {
    this._value = value
    this.deps = new Set()
  }

  get value() {
    const result = this._value
    trackRefValue(this.deps)
    return result
  }

  set value(newValue) {
    if (hasChanged(this._value, newValue)) {
      this._value = newValue
      triggerEffects(this.deps)
    }
  }
}

export function ref(simple: refImp) {
  return new RefImpl(simple)
}

function trackRefValue(deps: Set<any>) {
  if (isTracking()) {
    trackEffect(deps)
  }
}