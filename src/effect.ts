type effectOptions = {
  scheduler?: () => void,
  stop?: () => void,
  [key: string]: any
}
let activeEffect: ReactiveEffect
let shouldTrack: boolean;
class ReactiveEffect {
  _fn: () => any
  options: effectOptions
  deps: Set<any>
  active = true

  constructor(fn: () => void, options?: effectOptions) {
    this.deps = new Set()
    this._fn = fn
    this.options = options as effectOptions
  }

  run() {

    if (this.active) {
      activeEffect = this
      shouldTrack = true
      this._fn()
      shouldTrack = false // 因为是全局变量，这里做复原操作
    }
    

    const fn: any = this._fn.bind(this)
    fn._effect =  this

    return fn
  }

  stop() {
    if (!this.active) {
      return
    }

    if (typeof this.options?.onStop === 'function') {
      this.options.onStop()
    }
    
    this.clearDeps()

    this.active = false
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


export function track(row: { [key: string]: any }, key: string | symbol | number) {
  if (!isTracking()) {
    return
  }
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
  trackEffect(fnDeps)
}

export function trackEffect(dep: any) {
  // 用 dep 来收集所有的依赖
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.add(dep)
  }
}

export function isTracking() {
  return activeEffect && shouldTrack
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
  triggerEffects(fnDeps)
}

export function triggerEffects(deps: any) {
  for (const effect of deps) {
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