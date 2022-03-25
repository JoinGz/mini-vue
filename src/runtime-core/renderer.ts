import { ShapeFlags } from '../shared/shapeFlags'
import { isObject } from '../shared/utils'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode: any, dom: any) {
  path(vnode, dom)
}
function path(vnode: any, dom: any) {
  // vnode 是组件，还是对象

  const { shapeFlag } = vnode
  
  if (shapeFlag & ShapeFlags.ELEMENT) {
    processElement(vnode, dom)
  } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
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
  const subTree = instance.render.call(instance.proxy)

  path(subTree, dom)

  instance.vnode.$el = subTree.$el

}
function processElement(vnode: any, dom: any) {
  mountElement(vnode, dom)
}

function mountElement(vnode: any, dom: any) {
  const el = vnode.$el = document.createElement(vnode.type)

  const { props } = vnode

  for (const key in props) {
    const value = props[key]
    el.setAttribute(key, value)
  }

  const { children, shapeFlag } = vnode
  if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    children.forEach((v: any) => {
      path(v, el)
    })
  } else {
    el.innerText = children
  }

  dom.append(el)
}
