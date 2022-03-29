import { Obj } from '../../types/base'
import { createRender } from '../runtime-core/renderer'

const createElement = (type: string) => {
  return document.createElement(type)
}

const insert = (dom: HTMLElement, el: HTMLElement) => {
  dom.append(el)
}

const patchProps = (key: string, value: any, el: HTMLElement) => {
  if (isOn(key)) {
    const eventName = key.slice(2).toLowerCase()
    el.addEventListener(eventName, value)
  } else {
    el.setAttribute(key, value)
  }
}

function isOn(key: string) {
  return /^on[A-Z]/.test(key)
}

const domRender = createRender({
  createElement,
  patchProps,
  insert,
})

export function createApp(arg: Obj) {
  return domRender.createApp(arg)
}