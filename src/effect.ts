type effectOptions = {
  scheduler: () => void,
  [key: string]: any
}
class ReactiveEffect {
  _fn: () => any
  options: effectOptions

  constructor(fn: () => void, options?: effectOptions) {
    this._fn = fn
    this.options = options as effectOptions
  }

  run() {
    nowEffect = this
    this._fn()
    return this._fn.bind(this)
  }
}

export function effect(
  fn: () => void,
  options?: effectOptions
): () => any {
  // 面向对象编程
  const _effect = new ReactiveEffect(fn, options)

  return _effect.run()
}

const trackMap = new Map()

let nowEffect: ReactiveEffect

export function track(row: { [key: string]: any }, key: string | symbol) {
  // target -> key -> dep
  let keyDeps = trackMap.get(row)
  if (!keyDeps) {
    keyDeps = new Map()
    trackMap.set(row, keyDeps)
  }
  let fnDeps = keyDeps.get(key)
  if (!fnDeps) {
    fnDeps = new Set()
    keyDeps.set(key, fnDeps)
  }
  fnDeps.add(nowEffect)
}


export function trigger(row: { [key: string]: any }, key: string | symbol) {
  let keyDeps = trackMap.get(row)
  if (!keyDeps) {
    return
  }
  let fnDeps = keyDeps.get(key)
  if (!fnDeps) {
    return
  }
  for (const effect of fnDeps) {
    if (typeof effect.options?.scheduler === 'function') {
      effect.options.scheduler()
    } else {
      effect.run()
    }
  }
}