import {
  getCurrentInstance,
} from '../../lib/index.esm.js'

export default {
  name: 'keepAlive',
  __isKeepAlive: true,
  setup() {
    const cacheMap = new Map()
    const instance = getCurrentInstance()

    const { move, createElement } = instance.vnode.keepAliveCtx
    const container = createElement('div')

    instance.activated = (container, el, insertBeforeDom) => {
      move(container, el, insertBeforeDom)
    }

    instance.deActivated = (el) => {
      move(container, el, null)
    }

    return function render() {
      const rawVnodeArr = instance.$slot.default()
      // 不是组件的直接返回
      if (typeof rawVnodeArr[0].type !== 'object') {
        return rawVnodeArr[0]
      }
      let rawVnode = cacheMap.get(rawVnodeArr[0].type)
      if (!rawVnode) {
        rawVnode = rawVnodeArr[0]
        cacheMap.set(rawVnode.type, rawVnode)
        // 避免卸载
        rawVnode.shouldKeepAlive = true
      } else {
        // 避免重新渲染
        rawVnode.keptAlive = true
        rawVnode.component = rawVnodeArr[0].type.component
      }
      
      rawVnode.keepAliveInstance = instance

      return rawVnode
    }
  },
}
