class ComputedRefImpl {
  private _fn: () => any

  constructor(fn: () => any) {
    this._fn = fn
  }

  get value() {
    return this._fn()
  }
}
export function computed(fn: () => any) {
  return new ComputedRefImpl(fn)
}
