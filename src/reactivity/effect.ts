import { isMap } from "../shared/utils"
import { triggerType, iterate_key, map_key_iterate_key } from "./baseHandler"

type effectOptions = {
  scheduler?: () => void,
  stop?: () => void,
  onStop?: ()=> void
}

// 函数，函数有对象的写法
type ReactiveEffectRunner<T = any> = {
  (): T,
  _effect: ReactiveEffect
}

const activeEffectList:ReactiveEffect[] = []
let activeEffect: ReactiveEffect | undefined | null
let shouldTrack: boolean;
export class ReactiveEffect<T = any> {
  _fn: () => T
  options: effectOptions
  deps: Set<any>
  active = true

  constructor(fn: () => T, options?: effectOptions) {
    this.deps = new Set()
    this._fn = fn
    this.options = options as effectOptions
  }

  run() {

    let result;

    if (this.active) {
      this.clearDeps()
      activeEffect = this
      activeEffectList.push(this)
      shouldTrack = true
      result = this._fn()
      activeEffectList.pop()
      activeEffect = activeEffectList[activeEffectList.length - 1]
      // activeEffect = null
      if (activeEffectList.length === 0 )
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

export function effect<T = any>(
  fn: () => T,
  options?: effectOptions
): ReactiveEffectRunner {
  // 面向对象编程
  const _effect = new ReactiveEffect(fn, options)

  _effect.run()

  const runner = _effect.run.bind(_effect) as ReactiveEffectRunner
  runner._effect = _effect 

  return runner
}

const trackWeakMap = new WeakMap()


export function track(row: { [key: string]: any }, key: string | symbol | number) {
  if (!isTracking()) {
    return
  }
  // target -> key -> dep
  let keyDeps = trackWeakMap.get(row)
  if (!keyDeps) {
    keyDeps = new Map()
    trackWeakMap.set(row, keyDeps)
  }
  let fnDeps = keyDeps.get(key)
  if (!fnDeps) {
    fnDeps = new Set()
    keyDeps.set(key, fnDeps)
  }
  trackEffect(fnDeps)
}

export function trackEffect(dep: Set<any>) {
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

export function trigger(row: { [key: string]: any }, key: string | symbol | number, label?: triggerType, value?: unknown) {
  
  let keyDeps = trackWeakMap.get(row)
  if (!keyDeps) {
    return
  }

  const deps = new Set();

  if (Array.isArray(row)) {
    if (label === triggerType.ADD) {
      const lengthDeps = keyDeps.get('length')
      if (lengthDeps) {
        for (const dep of lengthDeps) {
          deps.add(dep)
        }
      }
    }
    if (key === 'length') {
      keyDeps.forEach((item: any, key: number) => {
        if (key >= (value as number)) {
            for (const dep of item) {
              deps.add(dep)
            }
          }
        })
      
    }
  }

  if (
    label === triggerType.ADD ||
    label === triggerType.DELETED ||
    (isMap(row) && label === triggerType.SET)
  ) {
    let ownkeysDeps = keyDeps.get(iterate_key)
    if (ownkeysDeps) {
      for (const dep of ownkeysDeps) {
        deps.add(dep)
      }
    }
  }
  
  if (
    isMap(row) &&
    (label === triggerType.ADD || label === triggerType.DELETED)
  ) {
    let mapkeysDeps = keyDeps.get(map_key_iterate_key)
    if (mapkeysDeps) {
      for (const dep of mapkeysDeps) {
        deps.add(dep)
      }
    }
  }

  let fnDeps = keyDeps.get(key)
  if (fnDeps) {
    for (const dep of fnDeps) {
        deps.add(dep)
    }
  }
  triggerEffects(deps)
}

export function triggerEffects(deps: any) {
  const copyDeps = new Set<any>(deps)
  for (const effect of copyDeps) {
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

export function resetTracking() {
  shouldTrack = true
}
export function pauseTracking() {
  shouldTrack = false
}