import { h, ref, createTextVNode } from '../../lib/index.esm.js'

const Text = 'text'
const arrayVNode = [h('p', null, 'p-1'), h('p', null, 'p-2')]

export const array2Text = {
  name: 'array2Text',
  setup() {
    const showText = ref(false)

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
