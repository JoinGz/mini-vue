import { h, ref, createTextVNode } from '../../lib/index.esm.js'

const Text = 'text'
const arrayVNode = [h('p', null, 'p-1'), h('p', null, 'p-2')]

export const text2array = {
  name: 'array2Text',
  setup() {
    const showText = ref(true)

    window.showText = () => {
      showText.value = !showText.value
    }
    
    return {
      showText,
    }
  },
  render() {
    return h(
      'div',
      null,
      this.showText === true ? Text : arrayVNode
    )
  },
}
