import { h } from '../../lib/index.esm.js'
import foo from './foo.js'

export const helloWorld = {
  name: 'helloWorld',
  setup() {
    return {
      msg: 'p-one',
    }
  },
  render() {
    return h(
      'div',
      {
        id: 'hello',
      },
      [
        h('p', { onClick: () => console.log('clicked') }, 'hi, mini-vue!'),
        h('div', null, [h('p', null, this.msg), h('p', null, 'p-two')]),
        h(foo, {
          count: 1,
          onAdd() {
            console.log(`emit->add`, ...arguments)
          },
          onAddFoo() {
            console.log(`emit->add-foo`, ...arguments)
          },
        }),
      ]
    )
  },
}
