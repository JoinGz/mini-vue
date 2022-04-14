import { isObject } from '../shared/utils'
import { publicInstanceProxyHandler } from './componentsPublicInstance'
import { vnode, instance, Obj, parentInstance } from '../../types/base'
import { shallowReadOnly } from '../reactivity/reactive'
import { emit } from './componentEmit'
import { proxyRef } from '../reactivity/index'

let currentInstance: instance | null = null;

export function createComponentInstance(vnode: vnode, parentInstance: parentInstance) {
  const instance: instance = {
    type: vnode.type as {type: vnode, key: number| string},
    vnode,
    setupState: {},
    parent: parentInstance,
    provide: parentInstance ? parentInstance.provide : {},
    isMounted: false
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
    instance.setupState = proxyRef(setupBack)
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: instance) {
  if (instance.type.render) {
    instance.render = instance.type.render
  } else {
    if (compiler && instance.type.template) {
      instance.render = compiler(instance.type.template)
    }
  }
}

export function getCurrentInstance(){
  return currentInstance
}

export function setCurrentInstance(instance: typeof currentInstance) {
  currentInstance = instance
}

let compiler: (arg0: string) => (() => vnode) | undefined;

export function createCompiler(compile: any) {
  compiler = compile
}