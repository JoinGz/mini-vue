type effectOptions = {
  scheduler?: () => void,
  stop?: () => void,
  [key: string]: any
}
class ReactiveEffect {
  _fn: () => any
  options: effectOptions
  deps: Set<any>

  constructor(fn: () => void, options?: effectOptions) {
    this.deps = new Set()
    this._fn = fn
    this.options = options as effectOptions
  }

  run() {
    nowEffect = this
    this._fn()

    const fn: any = this._fn.bind(this)
    fn._effect =  this

    return fn
  }

  stop() {

    if (typeof this.options?.onStop === 'function') {
      this.options.onStop()
    }
    
    this.clearDeps()

  }

  clearDeps() {
    for (const setItem of this.deps) {
      setItem.delete(this)
    }
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

export function track(row: { [key: string]: any }, key: string | symbol | number) {
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
  if (nowEffect) {
    fnDeps.add(nowEffect)
    nowEffect.deps.add(fnDeps)
  }
}


export function trigger(row: { [key: string]: any }, key: string | symbol | number) {
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

export function stop(fn: any) {
  fn._effect.stop()
}