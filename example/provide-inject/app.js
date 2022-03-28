import { h, provide } from '../../lib/index.esm.js'
import foo from './foo.js'

export const app = {
  name: 'app',
  setup () {
    provide('foo', 'app-foo')
    provide('bar', 'app-bar')
  },
  render () {
    return h(
      'div',
      {
        id: 'hello',
      },
      [
        h('p', { onClick: () => console.log('clicked') }, 'hi, mini-vue!'),
        h(foo, {})
      ]
    )
  },
}
