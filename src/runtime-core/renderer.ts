import { instance, vnode, parentInstance, props, children, Obj } from '../../types/base'
import { effect } from '../reactivity/effect'
import { getSequence } from '../shared/getSequence'
import { ShapeFlags } from '../shared/shapeFlags'
import { EMPTY_OBJ } from '../shared/utils'
import { createComponentInstance, setupComponent } from './component'
import { initProps } from './componentProps'
import { initSlots } from './componentSlot'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './createVnode'
import { queueJobs } from './scheduler'

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
        processFragment(vnode1, vnode2, dom, parentInstance, insertBeforeDom)
        break

      case Text:
        processText(vnode1, vnode2, dom, insertBeforeDom)
        break

      default:
        if (shapeFlag! & ShapeFlags.ELEMENT) {
          processElement(vnode1, vnode2, dom, parentInstance, insertBeforeDom)
        } else if (shapeFlag! & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode1, vnode2, dom, parentInstance, insertBeforeDom)
        }
        break
    }
  }

  function processComponent(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: parentInstance,
    insertBeforeDom: HTMLElement | null
  ) {
    if (!vnode1) {
      mountComponent(vnode1, vnode2, dom, parentInstance, insertBeforeDom)
    } else {
      console.log('更新组件');
      updateComponent(vnode1, vnode2, dom, parentInstance, insertBeforeDom)
    }
  }

  function mountComponent(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: parentInstance,
    insertBeforeDom: HTMLElement | null
  ) {
    const instance = vnode2.component = createComponentInstance(vnode2, parentInstance)

    initProps(instance, vnode2.props)

    initSlots(instance, vnode2.children)

    setupComponent(instance);

    setupRenderEffect(instance, dom, insertBeforeDom)
  }

  function setupRenderEffect(instance: instance, dom: HTMLElement, insertBeforeDom: HTMLElement | null) {

    instance.update = effect(() => {
      if (!instance.isMounted) {
        // init
        console.log('init');
        const subTree = instance.render!.call(instance.proxy, instance.proxy)
    
        instance.subTree = subTree
  
        patch(null, subTree, dom, instance, insertBeforeDom)
    
        instance.vnode.$el = subTree.$el

        instance.isMounted = true
      } else {
        // update
        console.log('update');
        const { next } = instance
        if (next) {
          next.$el = instance.vnode.$el
          updateComponentProps(instance, next)
        }
        const preSubTree = instance.subTree
        const subTree = instance.render!.call(instance.proxy, instance.proxy)
        instance.subTree = subTree
        
        patch(preSubTree!, subTree, dom, instance, insertBeforeDom)

      }
    }, {
      scheduler: () => {
        queueJobs(instance.update as () => any)
      }
    })

  }
  function processElement(
    vnode1: vnode | null,
    vnode2: vnode,
    dom: HTMLElement,
    parentInstance: parentInstance,
    insertBeforeDom: HTMLElement | null
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
    insertBeforeDom: HTMLElement | null
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
    if (!vnode1) {
      mountChildren(vnode2.children as vnode[], dom, parentInstance, insertBeforeDom)
    } else {
      patchChildren(vnode1, vnode2, dom, parentInstance, insertBeforeDom)
    }
  }

  function mountChildren(
    children: vnode[],
    dom: HTMLElement,
    parentInstance: parentInstance,
    insertBeforeDom: HTMLElement | null
  ) {
    ; (children as vnode[]).forEach((v: vnode) => {
      patch(null, v, dom, parentInstance, insertBeforeDom)
    })
  }

  function processText(vnode1: vnode | null, vnode2: vnode, dom: HTMLElement, insertBeforeDom: HTMLElement | null) {
    if (!vnode1) {
      const textNode = (vnode2.$el = document.createTextNode(
        vnode2.children as string
      ))
      // dom.appendChild(textNode)
      dom.insertBefore(textNode, insertBeforeDom)
    } else {
      const el = vnode2.$el = vnode1.$el
      if (vnode1.children !== vnode2.children) {
        el!.nodeValue = vnode2.children as string
      }
    }
  }

  function patchElement(vnode1: vnode, vnode2: vnode, dom: HTMLElement, parentInstance: parentInstance, insertBeforeDom: HTMLElement | null) {
    const preProps = vnode1?.props || EMPTY_OBJ
    const nowProps = vnode2?.props || EMPTY_OBJ
  
    const el = (vnode2.$el = vnode1!.$el)

    patchChildren(vnode1, vnode2, el as HTMLElement, parentInstance, insertBeforeDom)
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

  function patchChildren(oldVnode: vnode, newVnode: vnode, el: HTMLElement, parentInstance: parentInstance, insertBeforeDom: HTMLElement | null) {
    
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
        patchKeyChildren(oldVnode, newVnode, el, parentInstance, insertBeforeDom)
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
    while (i <= e1 && i <= e2) {
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
      // 0 1  2 3  4 5
      // a,b,(c,d),f,g
      // a,b,(e,c),f,g
      console.log('diff middle');
      // 新节点个数
      const toBePatchedNum = e2 - i + 1
      // key和自己的索引关系
      const keyToNewIndexMap: Obj = {}
      // 初始化映射
      const newIndexToOldIndex = new Array(toBePatchedNum)
      // 判断是否需要最长递增子序列
      let maxIndex = 0
      let needMove = false

      // a,b,(c,d,e),f,g
      // a,b,(e,c,d),f,g
      for (let i = 0; i < toBePatchedNum; i++) {
        newIndexToOldIndex[i] = 0
      }

      for (let j = i; j <= e2; j++) {
        const vnode = newChildren![j] as vnode;
        if (vnode.key) {
          keyToNewIndexMap[vnode.key] = j
        }
      }

      function getIndexFromKey(key: string | number) {
        return keyToNewIndexMap[key]
      }

      // 在老的节点里面遍历

      let currentIndex;

      let patchedNum = 0

      for (let j = i; j <= e1; j++) {

        // 如果新增的变化已经都patch过了，剩余的老的就可以全部删除了
        if (patchedNum >= toBePatchedNum) {
          remove((oldChildren![j] as vnode).$el)
          continue;
        }

        const vnode = oldChildren![j] as vnode
        if (vnode.key) {
          currentIndex = getIndexFromKey(vnode.key)
        } else {
          for (let k = i; k <= e2; k++) {
            const newVnode = newChildren![k] as vnode
            if (isSameVnodeType(vnode, newVnode)) {
              currentIndex = k;
              break;
            }
          }
        }

        if (currentIndex == null) {
          remove((oldChildren![j] as vnode).$el)
        } else {

          if (currentIndex >= maxIndex) {
            maxIndex = currentIndex
          } else {
            needMove = true
          }

          // 在更新新节点对应老节点位置信息时 j + 1 的目的: newIndexToOldIndex初始化的时候值为0，所有如果值没有改变表示
          // j 可能为零。newIndexToOldIndex为零时表示新节点在老节点不存在，需要新建。是有特殊含义的所以有映射关系的不能为零
          newIndexToOldIndex[currentIndex - i] = j + 1
          patch(oldChildren![j] as vnode, newChildren![currentIndex] as vnode, el, parentInstance, null)
          patchedNum++
        }
      }

      const increasingNewIndexSequence = needMove ? getSequence(newIndexToOldIndex) : []

      let sequenceIndex = increasingNewIndexSequence.length - 1;

      // 也可以把 N = toBePatchedNum，就可以少些加法操作
      for (let N = newIndexToOldIndex.length - 1; N >= 0; N--) {
          const nextIndex = N + i + 1
          const nextChild = newChildren![nextIndex] ? (newChildren![nextIndex] as vnode).$el : null
          // 新增元素
          if (newIndexToOldIndex[N] === 0) {
            patch(null, newChildren![nextIndex - 1] as vnode, el, parentInstance, nextChild as HTMLElement)
          } else if (needMove) {
            if (sequenceIndex < 0 || N !== increasingNewIndexSequence[sequenceIndex]) {
              insert(el, (newChildren![nextIndex - 1] as vnode).$el, nextChild)
              console.log('需要移动');
            } else {
              sequenceIndex--
            }
          }
      }
      // console.log(increasingNewIndexSequence)

      
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

function updateComponent(vnode1: vnode, vnode2: vnode, dom: HTMLElement, parentInstance: parentInstance, insertBeforeDom: HTMLElement | null) {
  const instance = vnode2.component = vnode1.component as instance // 上次的组件实例 instance
  
  if (shouldUpdateComponent(vnode1, vnode2)) {
    instance.next = vnode2
    instance.update!()
  } else {
    vnode2.$el = vnode1.$el
    instance.vnode = vnode2
  }


}

function updateComponentProps(instance: instance, next: vnode) {
  instance.vnode = next
  instance.next = null
  instance.props = next.props
}

function shouldUpdateComponent(vnode1: vnode, vnode2: vnode) {
  const { props: preProps } = vnode1
  const { props: nextProps } = vnode2
  for (const key in preProps) {
    if (preProps[key] !== nextProps![key]) {
      return true
    }
  }
  return false
}

