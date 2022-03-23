import { createComponentInstance, setupComponent } from './component'

export function render(vnode: any, dom: any) {
  path(vnode, dom)
}
function path(vnode: any, dom: any) {
  // vnode 是组件，还是对象

  processComponent(vnode, dom)
}

function processComponent(vnode: any, dom: any) {
  mountComponent(vnode, dom)
}

function mountComponent(vnode: any, dom: any) {
  const instance = createComponentInstance(vnode)

  setupComponent(instance)

  setupRenderEffect(instance, dom)
}

function setupRenderEffect(instance: any, dom: any) {
  const subTree = instance.render()

  path(subTree, dom)
}
