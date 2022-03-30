import { Obj } from '../../types/base'
import { createRender } from '../runtime-core/renderer'

const createElement = (type: string) => {
  return document.createElement(type)
}

const insert = (dom: HTMLElement, el: HTMLElement) => {
  dom.append(el)
}

const customsPropsHandler = (el: HTMLElement, key: string, preValue: any, nowValue: any) => {

  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase()
    el.addEventListener(eventName, nowValue)
  } else {
    if (nowValue == null) {
      el.removeAttribute(key)
    } else {
      el.setAttribute(key, nowValue)
    }
  }

}

function isOn(key: string) {
  return /^on[A-Z]/.test(key)
}

const remove = (el: HTMLElement) => {
  const parent = el.parentElement
  if (parent) {
    parent.removeChild(el)
  }
}

const setElementText = (el: HTMLElement, value: string) => {
  // const textNode = document.createTextNode(value)
  // el.appendChild(textNode)

  el.textContent = value
}

const domRender = createRender({
  createElement,
  customsPropsHandler,
  insert,
  remove,
  setElementText
})

export function createApp(arg: Obj) {
  return domRender.createApp(arg)
}