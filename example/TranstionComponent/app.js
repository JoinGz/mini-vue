import { h, ref, Transtion } from '../../lib/index.esm.js'
export const app = {
  name: 'app',
  setup() {
    const showFoo = ref(true)
    const changeShowFoo = () => {
      console.log(`Transtion child component will change`)
      showFoo.value = !showFoo.value
    }
    return {showFoo, changeShowFoo}
  },
  render() {
    return h(
      'div',
      {
        class: 'class',
      },
      [
        h(Transtion, {}, { default: () => this.showFoo ? h('p', null, 'p dom')  : h('div', {}, 'div dom')}),
        h('p', {onClick: this.changeShowFoo}, 'click me to change Transtion child component')
      ]
    )
  },
}
