import { instance, Obj } from "../../types/base"
import { hasOwn } from "../shared/utils"

const publicPropertiesMaps: Obj = {
  $el(i: instance) {
    return i.vnode.$el
  },
  $slot(i: instance) {
    return i.$slot
  },
  $props(i: instance) {
    return i.props
  },
}

export const publicInstanceProxyHandler = {
  get({ _: instance }: { _: any }, key: string | symbol) {

    if (hasOwn(instance.setupState, key)) {
      return instance.setupState[key]
      
    } else if (hasOwn(instance.props, key)) {
      return instance.props[key]
    }
    

    if (publicPropertiesMaps[key]) {
      return publicPropertiesMaps[key](instance)
    }
  },
  set(origin:any, key: string, newValue: any) {
    // console.log(origin, key, newValue)
    if (hasOwn(origin._.setupState, key)) {
      return Reflect.set(origin._.setupState, key ,newValue)
    }
    // set 待处理
    return Reflect.set(origin._, key ,newValue)
  }
}
