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
    return h('div', {
      id: 'hello',
      onClick: () => console.log('clicked')
    }, [
      h('p', null, 'hi, mini-vue!'),
      h('div', null, [h('p', null, this.msg), h('p', null, 'p-two')]),
      h(foo, {count: 1}, )
    ])
  },
}
