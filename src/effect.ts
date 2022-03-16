class ReactiveEffect {
  _fn: () => void

  constructor(fn: () => void) {
    this._fn = fn
  }

  run() {
    nowEffect = this
    return this._fn()
  }
}

export function effect(fn: () => void) {
  // 面向对象编程
  const _effect = new ReactiveEffect(fn)

  return _effect.run()
}

const trackMap = new Map()


let nowEffect: ReactiveEffect;

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
    effect.run()
  }
}