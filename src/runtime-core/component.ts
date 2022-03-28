import { isObject } from '../shared/utils'
import { publicInstanceProxyHandler } from './componentsPublicInstance'
import { vnode, instance, Obj, parentInstance } from '../../types/base'
import { shallowReadOnly } from '../reactivity/reactive'
import { emit } from './componentEmit'

let currentInstance: instance | null = null;

export function createComponentInstance(vnode: vnode, parentInstance: parentInstance) {
  const instance: instance = {
    type: vnode.type as {type: vnode},
    vnode,
    setupState: {},
    parent: parentInstance,
    provide: parentInstance ? parentInstance.provide : {}
  }

  instance.emit = emit.bind(null, instance)

  return instance
}

export function setupComponent(instance: instance) {
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: instance) {
  const { setup } = instance.type

  instance.proxy = new Proxy({_: instance}, publicInstanceProxyHandler)

  setCurrentInstance(instance)
  const setupBack = setup!(shallowReadOnly(instance.props!), {emit: instance.emit})
  setCurrentInstance(null)

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

export function getCurrentInstance(){
  return currentInstance
}

export function setCurrentInstance(instance: typeof currentInstance) {
  currentInstance = instance
}