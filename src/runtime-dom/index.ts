
export * from '../runtime-core/index'

export * from '../shared/toDisplayString'
import { Obj } from '../../types/base'
import { createRender } from '../runtime-core/renderer'
import { isArray } from '../shared/utils'

const createElement = (type: string) => {
  return document.createElement(type)
}

const insert = (dom: Element, el: Element, anchor: Element | null) => {
  // dom.append(el)
  dom.insertBefore(el, anchor)
}

function showsetProps(el: Element, key: string,) {
  if (el.tagName === 'INPUT' || key === 'form')
    return false
  return key in el
}

const customsPropsHandler = (el: Element & {_vei: any}, key: string, preValue: any, nowValue: any) => {

  if (key === 'class') {
    el.className = nowValue || ''
  }else
    if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase()
    let lastEvent = el._vei || (el._vei = {})
    if (lastEvent[key]) {
      if (!nowValue) {
        el.removeEventListener(eventName, lastEvent[key].handle)
        return;
      }
      lastEvent.bindTime = performance.now()

      lastEvent[key].value = nowValue
    } else {
      lastEvent.bindTime = performance.now()
      lastEvent[key] = el._vei[key] = {
        value: nowValue
      }
      lastEvent[key].handle = (...arg: any) => {
        // 如果事件发生的时间早于事件绑定的时间则不执行
        if (arg[0].timeStamp < lastEvent.bindTime) {
          return 
        }
        if (isArray(lastEvent[key].value)) {
          lastEvent[key].value.forEach((fn: any) => {
            fn(...arg)
          });
        } else {
          lastEvent[key].value && lastEvent[key].value(...arg)
        }
      }
      el.addEventListener(eventName, lastEvent[key].handle)
    }
  } else {
    if (nowValue == null) {
      el.removeAttribute(key)
    } else {
      if (showsetProps(el, key)) {
        if (typeof (el as any)[key] === 'boolean' && nowValue === '') {
           (el as any)[key] = true
        } else {
           (el as any)[key] = nowValue
        }
      }
      el.setAttribute(key, nowValue)
    }
  }

}

function isOn(key: string) {
  return /^on[A-Z]/.test(key)
}

const remove = (el: Element) => {
  const parent = el.parentElement
  if (parent) {
    parent.removeChild(el)
  }
}

const setElementText = (el: Element, value: string) => {
  // const textNode = document.createTextNode(value)
  // el.appendChild(textNode)

  el.textContent = value
}

function getNextHostNode(el: Element) {
  return el.nextSibling
}

const domRender = createRender({
  createElement,
  customsPropsHandler,
  insert,
  remove,
  setElementText,
  getNextHostNode
})

export function createApp(arg: Obj) {
  return domRender.createApp(arg)
}