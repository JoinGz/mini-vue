import { h, ref, createTextVNode } from '../../lib/index.esm.js'

const Text = 'text'
const newText = 'newText'

export const text2text = {
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
      this.showText === true ? Text : newText
    )
  },
}
