import { ReactiveEffect, track, trigger } from './effect'

class ComputedRefImpl<T> {
  private _fn: () => T
  private _dirty: boolean = false
  private _value!: T // 后面一定会有，就直接 非空断言操作符
  private _effect: ReactiveEffect<T>

  constructor(fn: () => T) {
    this._fn = fn
    this._dirty = false
    this._effect = new ReactiveEffect(fn, {
      scheduler: () => {
        this._dirty = false
        trigger(this, 'value')
      },
    })
  }

  get value() {
    if (!this._dirty) {
      this._value = this._effect.run()
      this._dirty = true
    }
    track(this, 'value')
    return this._value
  }
}
export function computed<T>(fn: () => T) {
  return new ComputedRefImpl(fn)
}
