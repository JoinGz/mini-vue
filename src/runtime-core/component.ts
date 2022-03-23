import { isObject } from '../shared/utils'

export function processComponent(vnode: any, dom: any) {
  mountComponent(vnode, dom)
}

function mountComponent(vnode: any, dom: any) {
  const instance = createComponentInstance(vnode)

  setupComponent(instance)

  return instance
}

export function createComponentInstance(vnode: any) {
  // initProps
  // initSlots
  const instance: any = {
    type: vnode.type,
    vnode,
    setupState: {},
  }

  return instance
}

export function setupComponent(instance: any) {
  // init props
  // init slots
  setupStatefulComponent(instance)
}

function setupStatefulComponent(instance: any) {
  const { setup } = instance.type

  const setupBack = setup()

  handleSetupResult(instance, setupBack)
}

function handleSetupResult(instance: any, setupBack: any) {
  if (typeof setupBack === 'function') {
    instance.render = setupBack
  } else if (isObject(setupBack)) {
    instance.setupState = setupBack
  }

  finishComponentSetup(instance)
}

function finishComponentSetup(instance: any) {
  if (instance.type.render) {
    instance.render = instance.type.render
  }
}
