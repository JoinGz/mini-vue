export function createApp(rootComponent: object) {
  const result = {
    mount(dom: any) {
      const vnode = createVnode(rootComponent)
      render(vnode, dom)
    }
  }
  return result
}

function createVnode(rootComponent: object, props?: any, children?: any) {
  const vnode = {
    type: rootComponent,
    props,
    children,
  }
  return vnode
}

function render(vnode: { type: object; props: any; children: any }, dom: any) {
  path(vnode, dom)
}

function path(vnode: { type: object; props: any; children: any }, dom: any) {
  processComponent(vnode, dom)
}

function processComponent(vnode: { type: object; props: any; children: any }, dom: any) {
  mountComponent(vnode, dom)
}

function mountComponent(vnode: { type: object; props: any; children: any }, dom: any) {
  const instance = createComponentInstance(vnode)

  setupStatefulComponent(instance)

  setupRenderEffect(instance, dom)
}

function createComponentInstance(vnode: { type: object; props: any; children: any }) {
  const instace = {
    vnode,
    type: vnode.type,
    setupState: {}
  }
  return instace
}



function setupStatefulComponent(instance: any) {
  const { setup } = instance.type.setup
  
  if (setup) {
    const setupBack = setup()

    if (typeof setupBack === 'function') {
      instance.render = setupBack
    } else if (typeof setupBack === 'object' && setupBack) {
      instance.setupState = setupBack
    }

    finishComponentSetup(instance)

  }

}

function finishComponentSetup(instance: any) {
  if (instance.type.render) {
    instance.render = instance.type.render
  }
}

function setupRenderEffect(instance:  any, dom: any) {
  const subTree = instance.render()

  path(subTree, dom)
}

