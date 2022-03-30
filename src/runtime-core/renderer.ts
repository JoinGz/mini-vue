import { instance, vnode, parentInstance, props, children } from '../../types/base'
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
  insert: (...arg: any[]) => any,
  remove: (...arg: any[]) => any,
  setElementText: (...arg: any[]) => any,
}) {
  const { customsPropsHandler, insert, createElement, remove, setElementText } = options

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

  function patchElement(vnode1: vnode, vnode2: vnode, dom: HTMLElement, parentInstance: parentInstance) {
    const preProps = vnode1?.props || EMPTY_OBJ
    const nowProps = vnode2?.props || EMPTY_OBJ
  
    const el = (vnode2.$el = vnode1!.$el)

    patchChildren(vnode1 , vnode2, el as HTMLElement, parentInstance)
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

  function patchChildren(oldVnode: vnode, newVnode: vnode, el: HTMLElement, parentInstance: parentInstance) {
    
    const { shapeFlag: oldShapeFlag } = oldVnode
    const { shapeFlag: newShapeFlag } = newVnode
    
    // 当 老节点是数组节点 新节点是文本节点时
    if (newShapeFlag! & ShapeFlags.STRING_CHILDREN) {
      if (oldShapeFlag! & ShapeFlags.ARRAY_CHILDREN) {
        // 删除老节点
        unmountChildren(oldVnode.children!)
      }
      // 设置新节点。不是 array_children 就是 string_children
      if (oldVnode.children !== newVnode.children) {
        setElementText(el, newVnode.children)
      }
    } else {
      if (oldShapeFlag! & ShapeFlags.STRING_CHILDREN) {
        setElementText(el, '')
        mountChildren(newVnode.children as vnode[], el, parentInstance)
      } else {
        console.log('diff array');
        patchKeyChildren(oldVnode, newVnode , el , parentInstance)
      }
    }



  }

  function patchKeyChildren(oldVnode: vnode, newVnode: vnode, el: HTMLElement, parentInstance: parentInstance) {
    
    const {children: oldChildren} = oldVnode
    const {children: newChildren} = newVnode

    let i = 0;
    let e1 = oldChildren!.length -1
    let e2 = newChildren!.length -1

    // 左端对比
    // (a b) c
    // (a b) d e
    while (i <= e1 && 1 <= e2) {
      if (isSameVnodeType(oldChildren![i] as vnode, newChildren![i] as vnode)) {
        patch(oldChildren![i] as vnode, newChildren![i] as vnode, el, parentInstance)
      } else {
        break;
      }
      i++
    }

    console.log('左端的i: ' + i);
    
    // 右边对比
    // a (b c)
    // d e (b c)
    // while (e1 >= i && e2 >= i) {
    while (i<=e1 && i <= e2) {
      if (isSameVnodeType(oldChildren![e1] as vnode, newChildren![e2] as vnode)) {
        patch(oldChildren![e1] as vnode, newChildren![e2] as vnode, el, parentInstance)
      } else {
        break;
      }
      e1--;
      e2--;
    }
    
    console.log('右端的e1: ' + e1);
    console.log('右端的e2: ' + e2);

  }

  function unmountChildren(children: children) {
    for (let i = 0; i < children.length; i++) {
      const vnode = children[i] as vnode;
      remove(vnode.$el)
    }
  }

  return {
    createApp: createAppAPI(render),
  }
}




function isSameVnodeType(oldVnode: vnode, newVnode: vnode) {
  return oldVnode?.type === newVnode?.type && oldVnode.key === newVnode.key
}

