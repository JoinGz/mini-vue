import { instance, vnode, parentInstance, props } from '../../types/base'
import { effect } from '../reactivity/effect'
import { ShapeFlags } from '../shared/shapeFlags'
import { EMPTY_OBJ } from '../shared/utils'
import { createComponentInstance, setupComponent } from './component'
import { initProps } from './componentProps'
import { initSlots } from './componentSlot'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './createVnode'

export function createRender(options: {
  createElement: (...arg: any[]) => any
  customsPropsHandler: (...arg: any[]) => any
  insert: (...arg: any[]) => any
}) {
  const { customsPropsHandler, insert, createElement } = options

  function render(vnode: vnode, dom: HTMLElement) {
    patch(null, vnode, dom, null)
  }

  function patch(vnode1: vnode | null, vnode2: vnode, dom: HTMLElement, parentInstance: parentInstance) {
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
    dom: HTMLElement,
    parentInstance: parentInstance
  ) {
    mountComponent(vnode1, vnode2, dom, parentInstance)
  }

  function mountComponent(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: parentInstance
  ) {
    const instance = createComponentInstance(vnode2, parentInstance)

    initProps(instance, vnode2.props)

    initSlots(instance, vnode2.children)

    setupComponent(instance)

    setupRenderEffect(instance, dom)
  }

  function setupRenderEffect(instance: instance, dom: HTMLElement) {

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
    dom: HTMLElement,
    parentInstance: parentInstance
  ) {
    if (!vnode1) {
      mountElement(vnode1, vnode2, dom, parentInstance)
    } else {
      patchElement(vnode1, vnode2, dom, parentInstance)
      console.log('update -> element')
    }
  }

  function mountElement(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: parentInstance
  ) {
    const el = (vnode2.$el = createElement(vnode2.type as string))

    const { props } = vnode2

    for (const key in props) {
      const value = props[key]
      customsPropsHandler(el, key, null, value)
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
    dom: HTMLElement,
    parentInstance: parentInstance
  ) {
    mountChildren(vnode2.children as vnode[], dom, parentInstance)
  }

  function mountChildren(
    children: vnode[],
    dom: HTMLElement,
    parentInstance: parentInstance
  ) {
    ;(children as vnode[]).forEach((v: vnode) => {
      patch(null, v, dom, parentInstance)
    })
  }

  function processText(vnode1: vnode | null, vnode2: vnode, dom: HTMLElement) {
    const textNode = (vnode2.$el = document.createTextNode(
      vnode2.children as string
    ))
    dom.appendChild(textNode)
  }

  function patchElement(vnode1: vnode | null, vnode2: vnode, dom: HTMLElement, parentInstance: parentInstance) {
    const preProps = vnode1?.props || EMPTY_OBJ
    const nowProps = vnode2?.props || EMPTY_OBJ
  
    const el = (vnode2.$el = vnode1!.$el)

    patchProps(el!, preProps, nowProps)
  
  }
  
  function patchProps(el: HTMLElement | Text, preProps: props, nowProps: props) {

    if (preProps !== nowProps) { // 都没有值的时候
      for (const key in preProps) {
        // 剔除没有新值的老值
        if (!(key in nowProps)) {
          customsPropsHandler(el, key, preProps[key], null)
        }
      }
      
      if (nowProps !== EMPTY_OBJ) {
        for (const key in nowProps) {
          const nowValue = nowProps[key]
          const preValue = preProps[key]
          if (nowValue !== preValue) {
            customsPropsHandler(el, key, preValue, nowValue)
          }
        }
      }
    }

  }


  return {
    createApp: createAppAPI(render),
  }
}


