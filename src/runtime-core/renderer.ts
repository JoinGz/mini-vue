import { isObject } from '../shared/utils'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode: any, dom: any) {
  path(vnode, dom)
}
function path(vnode: any, dom: any) {
  // vnode 是组件，还是对象

  if (typeof vnode.type === 'string') {
    processElement(vnode, dom)
  } else if (isObject(vnode.type)) {
    processComponent(vnode, dom)
  }
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
function processElement(vnode: any, dom: any) {
  mountElement(vnode, dom)
}

function mountElement(vnode: any, dom: any) {
  const el = document.createElement(vnode.type)

  const { props } = vnode

  for (const key in props) {
    const value = props[key]
    el.setAttribute(key, value)
  }

  const { children } = vnode
  if (Array.isArray(children)) {
    children.forEach((v) => {
      path(v, el)
    })
  } else {
    el.innerText = children
  }

  dom.append(el)
}
