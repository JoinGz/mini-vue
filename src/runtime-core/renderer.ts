import { instance, vnode } from '../../types/base'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { initProps } from './componentProps'
import { initSlots } from './componentSlot'
import { Fragment, Text } from './createVnode'

export function render(vnode: vnode, dom: Element) {
  path(vnode, dom)
}
function path(vnode: vnode, dom: Element) {
  // vnode 是组件，还是对象


  const { shapeFlag, type } = vnode
  
  switch (type) {
    case Fragment:
        processFragment(vnode, dom)
      break;
    
    case Text:
        processText(vnode, dom)
      break;
  
    default:
        if (shapeFlag! & ShapeFlags.ELEMENT) {
          processElement(vnode, dom)
        } else if (shapeFlag! & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, dom)
        }
      break;
  }

}

function processComponent(vnode: vnode, dom: Element) {
  mountComponent(vnode, dom)
}

function mountComponent(vnode: vnode, dom: Element) {
  const instance = createComponentInstance(vnode)
  
  initProps(instance, vnode.props)
  
  initSlots(instance, vnode.children)

  setupComponent(instance)

  setupRenderEffect(instance, dom)
}

function setupRenderEffect(instance: instance, dom: Element) {
  const subTree = instance.render!.call(instance.proxy)

  path(subTree, dom)

  instance.vnode.$el = subTree.$el

}
function processElement(vnode: vnode, dom: Element) {
  mountElement(vnode, dom)
}

function mountElement(vnode: vnode, dom: Element) {
  const el = vnode.$el = document.createElement(vnode.type as string)

  const { props } = vnode

  for (const key in props) {
    const value = props[key]
    if (isOn(key)) {
      const eventName = key.slice(2).toLowerCase()
      el.addEventListener(eventName, value)
    } else {
      el.setAttribute(key, value)
    }
  }

  const { children, shapeFlag } = vnode
  if (shapeFlag! & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children as vnode[], el)
  } else {
    el.innerText = children as string
  }

  dom.append(el)
}

function isOn(key: string) {
  return /^on[A-Z]/.test(key)
}

function processFragment(vnode: vnode, dom: Element) {
  mountChildren(vnode.children as vnode[], dom)
}

function mountChildren(children: vnode[], dom: Element) {
  (children as vnode[]).forEach((v: vnode) => {
    path(v, dom)
  })
}

function processText(vnode: vnode, dom: Element) {
  const textNode = vnode.$el =  document.createTextNode(vnode.children as string)
  dom.appendChild(textNode)
}

