import { h } from '../../lib/index.esm.js'
import foo from './foo.js'

export const helloWorld = {
  name: 'helloWorld',
  setup() {
    return {
      msg: 'p-one',
    }
  },
  render () {
    const signSlot = h('p', null, 'foo-children')
    const arraySlots = [h('p', null, 'foo-children')]
    const slots = {
      header: ({age}) => h('p', null, 'header' + age),
      footer: () => h('p', null, 'footer'),
    }
    return h(
      'div',
      {
        id: 'hello',
      },
      [
        h('p', { onClick: () => console.log('clicked') }, 'hi, mini-vue!'),
        h(foo, {}, slots),
      ]
    )
  },
}
