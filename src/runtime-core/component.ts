import { isObject } from '../shared/utils'
import { publicInstanceProxyHandler } from './componentsPublicInstance'
import { vnode, instance, Obj } from '../../types/base'
import { shallowReadOnly } from '../reactivity/reactive'


export function createComponentInstance(vnode: vnode) {
  const instance: instance = {
    type: vnode.type as {type: vnode},
    vnode,
    setupState: {},
  }

  return instance
}

export function setupComponent(instance: instance) {
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: instance) {
  const { setup } = instance.type

  instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandler)

  const setupBack = setup!(shallowReadOnly(instance.props!))

  handleSetupResult(instance, setupBack)
}

function handleSetupResult(instance: instance, setupBack:  Obj | ( () => vnode  )) {
  if (typeof setupBack === 'function') {
    instance.render  = setupBack as () => vnode
  } else if (isObject(setupBack)) {
    instance.setupState = setupBack
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: instance) {
  if (instance.type.render) {
    instance.render = instance.type.render
  }
}
