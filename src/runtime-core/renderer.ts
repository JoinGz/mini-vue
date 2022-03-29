import { instance, vnode, parentInstance } from '../../types/base'
import { effect } from '../reactivity/effect'
import { ShapeFlags } from '../shared/shapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { initProps } from './componentProps'
import { initSlots } from './componentSlot'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './createVnode'

export function createRender(options: {
  createElement: (...arg: any[]) => any
  patchProps: (...arg: any[]) => any
  insert: (...arg: any[]) => any
}) {
  const { patchProps, insert, createElement } = options

  function render(vnode: vnode, dom: Element) {
    patch(null, vnode, dom, null)
  }

  function patch(vnode1: vnode | null, vnode2: vnode, dom: Element, parentInstance: parentInstance) {
    // vnode 是组件，还是对象

    const { shapeFlag, type } = vnode2

    switch (type) {
      case Fragment:
        processFragment(vnode1 ,vnode2, dom, parentInstance)
        break

      case Text:
        processText(vnode1 ,vnode2, dom)
        break

      default:
        if (shapeFlag! & ShapeFlags.ELEMENT) {
          processElement(vnode1 ,vnode2, dom, parentInstance)
        } else if (shapeFlag! & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode1 ,vnode2, dom, parentInstance)
        }
        break
    }
  }

  function processComponent(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: Element,
    parentInstance: parentInstance
  ) {
    mountComponent(vnode1, vnode2, dom, parentInstance)
  }

  function mountComponent(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: Element,
    parentInstance: parentInstance
  ) {
    const instance = createComponentInstance(vnode2, parentInstance)

    initProps(instance, vnode2.props)

    initSlots(instance, vnode2.children)

    setupComponent(instance)

    setupRenderEffect(instance, dom)
  }

  function setupRenderEffect(instance: instance, dom: Element) {

    effect(() => {
      if (!instance.isMounted) {
        // init
        console.log('init');
        const subTree = instance.render!.call(instance.proxy)
    
        instance.subTree = subTree
  
        patch(null, subTree, dom, instance)
    
        instance.vnode.$el = subTree.$el

        instance.isMounted = true
      } else {
        // update
        console.log('update');
        const preSubTree = instance.subTree
        const subTree = instance.render!.call(instance.proxy)
        instance.subTree = subTree
  
        patch(preSubTree!, subTree, dom, instance)

      }
    })

  }
  function processElement(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: Element,
    parentInstance: parentInstance
  ) {
    if (!vnode1) {
      mountElement(vnode1, vnode2, dom, parentInstance)
    } else {
      console.log('update -> element')
    }
  }

  function mountElement(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: Element,
    parentInstance: parentInstance
  ) {
    const el = (vnode2.$el = createElement(vnode2.type as string))

    const { props } = vnode2

    for (const key in props) {
      const value = props[key]
      patchProps(key, value, el)
    }

    const { children, shapeFlag } = vnode2
    if (shapeFlag! & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children as vnode[], el, parentInstance)
    } else {
      el.innerText = children as string
    }

    insert(dom, el)
  }

  function processFragment(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: Element,
    parentInstance: parentInstance
  ) {
    mountChildren(vnode2.children as vnode[], dom, parentInstance)
  }

  function mountChildren(
    children: vnode[],
    dom: Element,
    parentInstance: parentInstance
  ) {
    ;(children as vnode[]).forEach((v: vnode) => {
      patch(null, v, dom, parentInstance)
    })
  }

  function processText(vnode1: vnode | null, vnode2: vnode, dom: Element) {
    const textNode = (vnode2.$el = document.createTextNode(
      vnode2.children as string
    ))
    dom.appendChild(textNode)
  }

  return {
    createApp: createAppAPI(render),
  }
}
