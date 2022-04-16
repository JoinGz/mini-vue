type effectOptions = {
  scheduler?: () => void,
  stop?: () => void,
  [key: string]: any
}

// 函数，函数有对象的写法
type ReactiveEffectRunner<T = any> = {
  (): T,
  _effect: ReactiveEffect
}

let activeEffect: ReactiveEffect | null
let shouldTrack: boolean;
export class ReactiveEffect {
  _fn: () => any
  options: effectOptions
  deps: Set<any>
  active = true

  constructor(fn: () => any, options?: effectOptions) {
    this.deps = new Set()
    this._fn = fn
    this.options = options as effectOptions
  }

  run() {

    let result;

    if (this.active) {
      activeEffect = this
      shouldTrack = true
      result = this._fn()
      activeEffect = null
      shouldTrack = false // 因为是全局变量，这里做复原操作
    } else {
      result = this._fn()
    }
    

    return result

    // runner 不在run里面返回，而是返回用户函数的返回值
    // runner 放在 effect 里面返回，这个 run 就多一个返回值功能
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
  fn: () => any,
  options?: effectOptions
): ReactiveEffectRunner {
  // 面向对象编程
  const _effect: any = new ReactiveEffect(fn, options)

  _effect.run()

  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner._effect = _effect 

  return runner
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
    // 反向搜集所有的依赖(set需要出发的函数)
    // 在调用stop的时候清除
    activeEffect!.deps.add(dep)
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
    if (effect !== activeEffect) {
      if (typeof effect.options?.scheduler === 'function') {
        effect.options.scheduler()
      } else {
        effect.run()
      }
    }
  }
}

export function stop(fn: ReactiveEffectRunner) {
  fn._effect.stop()
}