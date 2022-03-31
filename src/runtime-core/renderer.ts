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
    patch(null, vnode, dom, null, null)
  }

  function patch(vnode1: vnode | null, vnode2: vnode, dom: HTMLElement, parentInstance: parentInstance, insertBeforeDom: HTMLElement | null) {
    // vnode 是组件，还是对象

    const { shapeFlag, type } = vnode2

    switch (type) {
      case Fragment:
        processFragment(vnode1 ,vnode2, dom, parentInstance, insertBeforeDom)
        break

      case Text:
        processText(vnode1 ,vnode2, dom, insertBeforeDom)
        break

      default:
        if (shapeFlag! & ShapeFlags.ELEMENT) {
          processElement(vnode1 ,vnode2, dom, parentInstance, insertBeforeDom)
        } else if (shapeFlag! & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode1 ,vnode2, dom, parentInstance, insertBeforeDom)
        }
        break
    }
  }

  function processComponent(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: parentInstance,
    insertBeforeDom: HTMLElement|null
  ) {
    mountComponent(vnode1, vnode2, dom, parentInstance, insertBeforeDom)
  }

  function mountComponent(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: parentInstance,
    insertBeforeDom: HTMLElement|null
  ) {
    const instance = createComponentInstance(vnode2, parentInstance)

    initProps(instance, vnode2.props)

    initSlots(instance, vnode2.children)

    setupComponent(instance)

    setupRenderEffect(instance, dom, insertBeforeDom)
  }

  function setupRenderEffect(instance: instance, dom: HTMLElement, insertBeforeDom: HTMLElement|null) {

    effect(() => {
      if (!instance.isMounted) {
        // init
        console.log('init');
        const subTree = instance.render!.call(instance.proxy)
    
        instance.subTree = subTree
  
        patch(null, subTree, dom, instance, insertBeforeDom)
    
        instance.vnode.$el = subTree.$el

        instance.isMounted = true
      } else {
        // update
        console.log('update');
        const preSubTree = instance.subTree
        const subTree = instance.render!.call(instance.proxy)
        instance.subTree = subTree
  
        patch(preSubTree!, subTree, dom, instance, insertBeforeDom)

      }
    })

  }
  function processElement(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: parentInstance,
    insertBeforeDom: HTMLElement|null
  ) {
    if (!vnode1) {
      mountElement(vnode1, vnode2, dom, parentInstance, insertBeforeDom)
    } else {
      patchElement(vnode1, vnode2, dom, parentInstance, insertBeforeDom)
      console.log('update -> element')
    }
  }

  function mountElement(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: parentInstance,
    insertBeforeDom: HTMLElement|null
  ) {
    const el = (vnode2.$el = createElement(vnode2.type as string))

    const { props } = vnode2

    for (const key in props) {
      const value = props[key]
      customsPropsHandler(el, key, null, value)
    }

    const { children, shapeFlag } = vnode2
    if (shapeFlag! & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children as vnode[], el, parentInstance, insertBeforeDom)
    } else {
      el.innerText = children as string
    }

    insert(dom, el, insertBeforeDom)
  }

  function processFragment(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: parentInstance,
    insertBeforeDom: HTMLElement | null
  ) {
    mountChildren(vnode2.children as vnode[], dom, parentInstance, insertBeforeDom)
  }

  function mountChildren(
    children: vnode[],
    dom: HTMLElement,
    parentInstance: parentInstance,
    insertBeforeDom: HTMLElement | null
  ) {
    ;(children as vnode[]).forEach((v: vnode) => {
      patch(null, v, dom, parentInstance, insertBeforeDom)
    })
  }

  function processText(vnode1: vnode | null, vnode2: vnode, dom: HTMLElement, insertBeforeDom: HTMLElement|null) {
    const textNode = (vnode2.$el = document.createTextNode(
      vnode2.children as string
    ))
    // dom.appendChild(textNode)
    dom.insertBefore(textNode, insertBeforeDom)
  }

  function patchElement(vnode1: vnode, vnode2: vnode, dom: HTMLElement, parentInstance: parentInstance, insertBeforeDom: HTMLElement|null) {
    const preProps = vnode1?.props || EMPTY_OBJ
    const nowProps = vnode2?.props || EMPTY_OBJ
  
    const el = (vnode2.$el = vnode1!.$el)

    patchChildren(vnode1 , vnode2, el as HTMLElement, parentInstance, insertBeforeDom)
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

  function patchChildren(oldVnode: vnode, newVnode: vnode, el: HTMLElement, parentInstance: parentInstance, insertBeforeDom: HTMLElement|null) {
    
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
        mountChildren(newVnode.children as vnode[], el, parentInstance, insertBeforeDom)
      } else {
        console.log('diff array');
        patchKeyChildren(oldVnode, newVnode , el , parentInstance, insertBeforeDom)
      }
    }



  }

  function patchKeyChildren(oldVnode: vnode, newVnode: vnode, el: HTMLElement, parentInstance: parentInstance, insertBeforeDom: HTMLElement|null) {
    
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
        patch(oldChildren![i] as vnode, newChildren![i] as vnode, el, parentInstance, insertBeforeDom)
      } else {
        break;
      }
      i++
    }

    console.log('左端的i: ' + i);
    
    // 右边对比
    //   a (b c)
    // d e (b c)
    while (e1 >= i && e2 >= i) {
      if (isSameVnodeType(oldChildren![e1] as vnode, newChildren![e2] as vnode)) {
        patch(oldChildren![e1] as vnode, newChildren![e2] as vnode, el, parentInstance, insertBeforeDom)
      } else {
        break;
      }
      e1--;
      e2--;
    }
    
    console.log('右端的e1: ' + e1);
    console.log('右端的e2: ' + e2);


    // 3. 新的比老的长
    //     创建新的
    // 左侧
    // (a b)
    // (a b) c d

    // 右侧 (逻辑同样适用)
    //     (a b)
    // c d (a b)
    if (i > e1) {
      if (i <= e2) {
        const insertBeforeInstance = newChildren![e2 + 1] as vnode
        const insertBeforeDom = insertBeforeInstance ? insertBeforeInstance.$el : null
        while (i <= e2) {
          patch(null, newChildren![i] as vnode, el, parentInstance, insertBeforeDom as HTMLElement)
          i++
        }
      }
    } else if (i > e2 ) {
      // 4. 老的比新的长
      //     删除老的
      // 左侧
      // (a b) c
      // (a b)
      
      // 右侧
      // a (b c)
      //   (b c)

      while (i <= e1) {
        const deleteInstance = oldChildren![i] as vnode
        remove(deleteInstance.$el)
        i++
      }



    } else {
      console.log('todo');
      
    }



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

