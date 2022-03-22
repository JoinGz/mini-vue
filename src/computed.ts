import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private _fn: () => any
  private _dirty: boolean
  private _value: any
  private _effect: any

  constructor(fn: () => any) {
    this._fn = fn
    this._dirty = false
    this._effect = new ReactiveEffect(fn, {
      scheduler: () => {
        this._dirty = false
      },
    })
  }

  get value() {
    if (!this._dirty) {
      this._value = this._effect.run()
      
      this._dirty = true
    }
    return this._value
  }
}
export function computed(fn: () => any) {
  return new ComputedRefImpl(fn)
}
