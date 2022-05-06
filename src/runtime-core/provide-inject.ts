import { instance } from "../../types/base";
import { getCurrentInstance } from "./component";

export function provide(key: string, value: any) {
  const currentInstance: instance | null = getCurrentInstance()
  
  if (currentInstance) {
    /**
     * 在provide赋值的时候，如果存在父实例会直接赋值父实例的provide
     * 所以如果当前的provide等于父实例的provide时候就说明是初始化
     * 初始化时我们就创建原型链条，后面就直接赋值就可以了
     */
    if (currentInstance.provide === currentInstance.parent?.provide) {
      // 更改provide指向，后面就不会再相等
      currentInstance.provide  = Object.create(currentInstance.parent.provide)
    }
    currentInstance.provide[key] = value
  }
  
}

export function inject(key: string, defaultValue: any) {
  const currentInstance: instance | null = getCurrentInstance()

  if (!currentInstance) {
    console.warn(`没有currentInstance`)
    return
  }
  const { parent } = currentInstance
  if (key in parent!.provide) {
    return parent!.provide[key]
  } else if (defaultValue) {
    if (typeof defaultValue === 'function') {
      return defaultValue()
    }
    return defaultValue
  }
}