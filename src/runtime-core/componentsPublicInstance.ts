import { instance, Obj } from "../../types/base"

const publicPropertiesMaps: Obj = {
  $el(i: instance) {
    return i.vnode.$el
  },
}

export const publicInstanceProxyHandler = {
  get({ _: instance }: { _: any }, key: string | symbol) {
    if (key in instance.setupState) {
      return instance.setupState[key]
    }

    if (publicPropertiesMaps[key]) {
      return publicPropertiesMaps[key](instance)
    }
  },
}
