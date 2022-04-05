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
}
